import { Injectable } from "@angular/core";
import { HTTP } from "@ionic-native/http/ngx";
import { AngularFireAuth } from "@angular/fire/auth";

@Injectable({
    providedIn: "root"
})
export class AuthService {
    constructor(private http: HTTP, private afAuth: AngularFireAuth) {}

    getCustomToken(email) {
        return this.http.post(
            "https://us-central1-linkedin-auth-ff668.cloudfunctions.net/getCredential",
            {
                email: email
            },
            {}
        );
    }

    signInWithToken(token) {
        return this.afAuth.auth.signInWithCustomToken(token);
    }

    updateUserInfo(user) {
        const updateProfilePromise = this.afAuth.auth.currentUser.updateProfile(
            {
                displayName: user.displayName,
                photoURL: user.profile
            }
        );
        const updateEmailPromise = this.afAuth.auth.currentUser.updateEmail(
            user.email
        );
        return Promise.all([updateProfilePromise, updateEmailPromise]);
    }
}
