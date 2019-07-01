import { HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { HTTP } from "@ionic-native/http/ngx";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: "root"
})
export class LinkedinService {
    constructor(private http: HTTP) {}

    getRandomState() {
        var text = "";
        var possible =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 21; i++)
            text += possible.charAt(
                Math.floor(Math.random() * possible.length)
            );

        return text;
    }

    getAccessToken(authCode) {
        const body = {
            grant_type: "authorization_code",
            code: authCode,
            redirect_uri: "http://localhost/callback",
            client_id: environment.linkedinClientId,
            client_secret: environment.linkedinClientSecret
        };

        const httpOptions = {
            headers: new HttpHeaders({
                "Content-Type": "application/x-www-form-urlencoded"
            })
        };

        const headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        };

        return this.http.post(
            "https://www.linkedin.com/oauth/v2/accessToken",
            body,
            headers
        );
    }

    getName(accessToken) {
        const headers = {
            Authorization: `Bearer ${accessToken}`
        };
        return new Promise((resolve, reject) => {
            this.http
                .get("https://api.linkedin.com/v2/me", {}, headers)
                .then(profile => {
                    const parsedProfile = JSON.parse(profile.data);

                    const firstName =
                        parsedProfile["firstName"].localized.en_US;
                    const lastName = parsedProfile["lastName"].localized.en_US;

                    resolve(firstName + " " + lastName);
                })
                .catch(err => {
                    console.error(err);
                    reject("Error. Couldn't fetch name");
                });
        });
    }

    getProfilePic(accessToken) {
        const headers = {
            Authorization: `Bearer ${accessToken}`
        };

        return new Promise((resolve, reject) => {
            this.http
                .get(
                    "https://api.linkedin.com/v2/me?projection=(id,profilePicture(displayImage~:playableStreams))",
                    {},
                    headers
                )
                .then(res => {
                    const parsedResponse = JSON.parse(res.data);
                    resolve(
                        parsedResponse["profilePicture"]["displayImage~"]
                            .elements[0].identifiers[0].identifier
                    );
                })
                .catch(err => {
                    reject("Error getting profile pic");
                });
        });
    }

    getEmail(accessToken) {
        const headers = {
            Authorization: `Bearer ${accessToken}`
        };
        return new Promise((resolve, reject) => {
            this.http
                .get(
                    "https://api.linkedin.com/v2/clientAwareMemberHandles?q=members&projection=(elements*(primary,type,handle~))",
                    {},
                    headers
                )
                .then(data => {
                    const parsedData = JSON.parse(data.data);
                    resolve(parsedData.elements[0]["handle~"].emailAddress);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }
}
