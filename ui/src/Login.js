import React from 'react';
import {useGoogleLogin, useGoogleLogout} from 'react-google-login';
import { useState } from 'react';
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import UserContext from "./Context";

const clientId = '410143290104-uo4i3j4jg0o03kr8momlu3ro1ogg0vee.apps.googleusercontent.com';

function Login() {
    const [user, setUser] = useState({
            name: "",
            loggedIn: false,
            hasAccount: false,
            prof: null,
        });
    const [show, setShow] = useState(false);
    const [name, setName] = useState("");
    const [last, setLast] = useState("");

    const onSuccess = (res) => {
        setUser({
            name: res.profileObj.givenName,
            loggedIn: true,
            hasAccount: false,
            prof: res.profileObj,
        })

        console.log('Login Success: currentUser:', res.profileObj);
        localStorage.setItem('authToken', res.tokenObj.id_token);
        // Check account existing
        fetchRemoteItems()
        refreshTokenSetup(res);
    };

    const onLogoutSuccess = (res) => {
        setUser({
            name: "",
            loggedIn: false,
        })
        localStorage.setItem('authToken', '');
        console.log('Logged out Success');
    };

    const onLogoutFailure = () => {
        setUser({
            name: "",
            loggedIn: false,
        })
        console.log('Handle failure cases');
    };

    const refreshTokenSetup = (res) => {
        let refreshTiming = (res.tokenObj.expires_in || 3600 - 5 * 60) * 1000;

        const refreshToken = async () => {
            const newAuthRes = await res.reloadAuthResponse();
            refreshTiming = (newAuthRes.expires_in || 3600 - 5 * 60) * 1000;
            localStorage.setItem('authToken', newAuthRes.id_token);

            setTimeout(refreshToken, refreshTiming);
            setUser({
                name: user.name,
                loggedIn: true,
                hasAccount: user.hasAccount,
            })
        };

        setTimeout(refreshToken, refreshTiming);
    };

    const onFailure = (res) => {
        console.log('Login failed: res:', res);
        setUser({
            name: "",
            loggedIn: false,
        })
    };

    const {signIn} = useGoogleLogin({
        onSuccess,
        onFailure,
        clientId,
        isSignedIn: true,
        accessType: 'offline',
    });

    const {signOut} = useGoogleLogout({
        clientId,
        onLogoutSuccess,
        onLogoutFailure,
    });

    const handleClose = () => {
        onLogoutSuccess(null)
    }

    const nameChange = (event) => {
        setName(event.target.value)
    }

    const lastChange = (event) => {
        setLast(event.target.value)
    }

    const fetchRemoteItems = () => {
        fetch("http://files.dblessy.com/user", {method: 'GET', headers: {
                'Authorization': localStorage.getItem("authToken"),
                'Accept': 'application/json'
            }})
            .then(res => res.json())
            .then(
                (result) => {
                   if (result.length === 1) {
                       setUser({
                           name: result[0].firstname,
                           loggedIn: true,
                           hasAccount: true,
                       })
                   } else {
                       setShow(true)
                   }
                },
                (error) => {
                    setShow(true)
                }
            )
    }

    const handleSave = () => {
        console.log(user.prof)
        console.log(name, last)

        let obj = {
            firstname: name,
            lastname: last,
            email: user.prof.email,
        }
        if (obj.firstname === "") {
            console.log(user.prof.givenName)
            obj.firstname = user.prof.givenName
        }

        if (obj.lastname === "") {
            console.log(user.prof.familyName)
            obj.lastname = user.prof.familyName
        }

        console.log(name, last)
        fetch(
            "http://files.dblessy.com/user", {method: 'POST', headers: {
                    'Authorization': localStorage.getItem("authToken"), 'Content-Type': 'application/json'},
                body: JSON.stringify(obj)}
        ).then((result) => {
            if (result.status === 200) {
                setUser({
                    name: user.name,
                    loggedIn: true,
                    hasAccount: true,
                })
            } else {
                onLogoutSuccess()
            }

        })
    }

    if (user.loggedIn === true && user.hasAccount === true) {
        console.log("here")
        return (
            <>
                Hello {user.name}
                <Button variant="outline-success" onClick={signOut}>
                    Sign out
                </Button>
            </>
        )
    } else if (user.loggedIn === true && user.hasAccount === false) {
        console.log(user.prof)
        return (
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Complete Registration</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control
                                type="email"
                                defaultValue={user.prof.email}
                                readOnly
                            />
                            <br/>
                            <Form.Label>First Name</Form.Label>
                            <Form.Control type="text" defaultValue={user.prof.givenName} onChange={nameChange}/>
                            <br />
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control type="text" defaultValue={user.prof.familyName} onChange={lastChange}/>
                            <br />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    } else {
        return (
            <Button variant="outline-success" onClick={signIn}>
                Sign in / Create Account
            </Button>
        )
    }
}

export default Login;