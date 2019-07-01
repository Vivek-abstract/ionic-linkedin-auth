import { Component } from "@angular/core";
import { LinkedIn } from "ng2-cordova-oauth/core";
import { AlertController, LoadingController, Platform } from "@ionic/angular";
import { OauthCordova } from "ng2-cordova-oauth/platform/cordova";
import { environment } from "src/environments/environment";
import { LinkedinService } from "../linkedin.service";
import { Router } from "@angular/router";
import { AuthService } from '../auth.service';

@Component({
    selector: "app-home",
    templateUrl: "home.page.html",
    styleUrls: ["home.page.scss"]
})
export class HomePage {
    private loading: any;

    constructor(
        private alertController: AlertController,
        private linkedinService: LinkedinService,
        private loadingController: LoadingController,
        private platform: Platform,
        private router: Router,
        private authService: AuthService
    ) {}

    linkedInLogin() {
        this.presentLoading();
        const provider = new LinkedIn({
            clientId: environment.linkedinClientId,
            appScope: ["r_emailaddress", "r_liteprofile"],
            redirectUri: "http://localhost/callback",
            responseType: "code",
            state: this.linkedinService.getRandomState()
        });
        const oauth = new OauthCordova();

        this.platform.ready().then(() => {
            oauth
                .logInVia(provider)
                .then(success => {
                    this.linkedinService
                        .getAccessToken(success["code"])
                        .then(data => {
                            const parsedResponse = JSON.parse(data.data);
                            const accessToken = parsedResponse.access_token;

                            const namePromise = this.linkedinService.getName(
                                accessToken
                            );
                            const picPromise = this.linkedinService.getProfilePic(
                                accessToken
                            );
                            const emailPromise = this.linkedinService.getEmail(
                                accessToken
                            );

                            Promise.all([namePromise, picPromise, emailPromise])
                                .then(results => {
                                    const name = results[0];
                                    const pic = results[1];
                                    const email = results[2];

                                    console.log(name, email, pic);
                                    this.createUser(name, email, email)
                                        .then(() => {
                                            this.loading.dismiss();
                                            this.router.navigateByUrl("dashboard");
                                        })
                                        .catch(err => {
                                            console.error(err);
                                            this.loading.dismiss();
                                            this.showAlert(
                                                "Error",
                                                "Something went wrong"
                                            );
                                        });
                                })
                                .catch(err => {
                                    this.loading.dismiss();
                                    this.showAlert(
                                        "Error",
                                        "Something went wrong"
                                    );
                                });
                        })
                        .catch(err => {
                            this.loading.dismiss();
                            console.error(err);
                            this.showAlert("Error", "Something went wrong");
                        });
                })
                .catch(err => {
                    this.loading.dismiss();
                    console.error(err);
                    this.showAlert("Error", "Something went wrong");
                });
        });
    }

    createUser(name, email, profilePicture) {
        return new Promise((resolve, reject) => {
            this.authService.getCustomToken(email).then(token => {
                this.authService
                    .signInWithToken(token.data)
                    .then(userCredentials => {
                        if (userCredentials["additionalUserInfo"].isNewUser) {
                            const user = {
                                name: name,
                                email: email,
                                profile: profilePicture,
                                uid: userCredentials["user"].uid
                            };
                            this.authService.updateUserInfo(user).then(() => {
                                resolve("Done");
                            });
                        }
                        this.router.navigateByUrl("dashboard");
                    });
            });
        });
    }

    async presentLoading() {
        this.loading = await this.loadingController.create({
            message: "Loading"
        });
        await this.loading.present();
    }

    async showAlert(title: string, msg: string) {
        const alert = await this.alertController.create({
            header: title,
            message: msg,
            buttons: ["OK"]
        });

        await alert.present();
    }
}
