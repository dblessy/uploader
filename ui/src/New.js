import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import React from 'react';
import {Toast} from "react-bootstrap";

class New extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            file: null,
            toast: false,
            message: "",
            description: ""
        }
    }

    changeHandler = (event) => {
        this.setState({
            file: event.target.files[0]
        });
    };

    changeDescription = (event) => {
        console.log(event)
        this.setState({
            file: this.state.file,
            description: event.target.value,
        })
    }
    reset = (event) => {
        this.setState({
            file: null,
            toast: false,
            message: "",
        })
    }

    handleSubmission = (e) => {
        e.preventDefault();

        const queryParams = new URLSearchParams(window.location.search)
        const file = queryParams.get("filename")

        console.log(file)
        if (file === null) {
            this.doPost()
        } else {
            this.doPut(file);
        }

    }

    doPost() {
        const formData = new FormData();

        formData.append('file', this.state.file);
        formData.append('description', this.state.description);

        fetch(
            "https://files.dblessy.com/upload", {method: 'POST', headers: {
                    'Authorization': localStorage.getItem("authToken")},
                body: formData}
        )
            .then((result) => {
                if (result.status === 200) {
                    this.setState({toast: true, message: "Upload successful"})
                } else {
                    this.setState({toast: true, message: "Upload failed"})
                }

            })
            .catch((error) => {
                console.error('Error:', error);
                this.setState({toast: true, message: "Upload failed"})
            });
    }

    doPut(id) {
        const formData = new FormData();
        formData.append('file', this.state.file);

        fetch(
            "https://files.dblessy.com/upload/" + id, {method: 'PUT', headers: {
                    'Authorization': localStorage.getItem("authToken")},
                body: formData}
        )
            .then((result) => {
                if (result.status === 200) {
                    this.setState({toast: true, message: "Update successful"})
                } else {
                    this.setState({toast: true, message: "Update failed"})
                }

            })
            .catch((error) => {
                console.error('Error:', error);
                this.setState({toast: true, message: "Update failed"})
            });
    }

    render() {
        return (
            <Container className="pb-1 p-5 mb-4 bg-light rounded-3">
                <Toast show={this.state.toast} onClose={this.reset}>
                    <Toast.Header>
                        <img
                            src="holder.js/20x20?text=%20"
                            className="rounded me-2"
                            alt=""
                        />
                        <strong className="me-auto">Message</strong>
                    </Toast.Header>
                    <Toast.Body>{this.state.message}</Toast.Body>
                </Toast>
                <Form>
                    <Form.Label>File Description</Form.Label>
                    <Form.Control type="text" onChange={this.changeDescription} placeholder="Provide a description" />
                    <br />

                    <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label>File to Upload</Form.Label>
                        <Form.Control type="file" onChange={this.changeHandler} />
                    </Form.Group>
                    <Button onClick={this.handleSubmission} variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>

            </Container>
        );
    }
}


export default New;