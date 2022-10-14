import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import React from 'react';

class Admin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            items: []
        }
    }

    setItems(remoteItems) {
        var items = [];
        remoteItems.forEach((item) => {
            let newItem = {
                fileKey: item.filekey,
                emailid: item.emailid,
                filename: item.filename,
                description: item.description,
                uploadTime: item.uploadtime,
                updateTime: item.updatetime,
            }
            items.push(newItem)
        });
        this.setState({
            isLoaded: true,
            items: items
        });
    }

    fetchRemoteItems() {
        fetch("http://files.dblessy.com/admin/upload", {method: 'GET', headers: {
                'Authorization': localStorage.getItem("authToken"),
                'Accept': 'application/json'
            }})
            .then(res => res.json())
            .then(
                (result) => {
                    this.setItems(result);
                    // render the table once the items are fetched
                    this.render()
                },
                (error) => {
                    this.setState({
                        isLoaded: false,
                        error
                    });
                }
            )
    }

    deleteRemoteItem(id) {
        fetch('http://files.dblessy.com/admin/upload/' + id, { method: 'DELETE', headers: {
                'Authorization': localStorage.getItem("authToken"),
            } })
            .then(res => res.json())
            .then(
                () => {
                    this.fetchRemoteItems()
                }
            )
    }

    componentDidMount() {
        this.fetchRemoteItems();
    }

    handleDelete = (id, e) => {
        e.preventDefault();
        console.log(id);

        this.deleteRemoteItem(id);
    }

    render() {
        let lists = [];
        if (this.state.isLoaded) {
            console.log(this.state.items)
            lists = this.state.items.map((item) =>
                <tr key={item.fileKey}>
                    <td>{item.filename}</td>
                    <td>{item.emailid} </td>
                    <td>{item.description}</td>
                    <td>{new Date(item.uploadTime * 1).toLocaleString()}</td>
                    <td>{new Date(item.updateTime * 1).toLocaleString()}</td>
                    <td>
                        <a href="#" onClick={(e) => this.handleDelete(item.fileKey, e)}>Remove</a> <br/>
                    </td>
                </tr>
            );
            return (
                <Container className="pb-1 p-5 mb-4 bg-light rounded-3">
                    <Table striped>
                        <thead>
                        <tr>
                            <th>File</th>
                            <th>User</th>
                            <th>Description</th>
                            <th>Created</th>
                            <th>Updated</th>
                            <th>Options</th>
                        </tr>
                        </thead>
                        <tbody>
                        {lists}
                        </tbody>
                    </Table>
                </Container>
            );

        } else {
            return (
                <Container className="pb-1 p-5 mb-4 bg-light rounded-3">
                    <h1>Not an admin</h1>
                </Container>
            )
        }

    }
}

export default Admin;

