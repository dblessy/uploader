import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import React from 'react';

class UploadsTable extends React.Component {
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
        fetch("http://files.dblessy.com/upload", {method: 'GET', headers: {
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
        fetch('http://files.dblessy.com/upload/' + id, { method: 'DELETE', headers: {
                'Authorization': localStorage.getItem("authToken"),
            } })
            .then(res => res.json())
            .then(
                () => {
                    this.fetchRemoteItems()
                }
            )
    }

    getRemoteItem(id) {
        fetch('http://files.dblessy.com/upload/' + id, { method: 'GET', headers: {
                'Authorization': localStorage.getItem("authToken")
            },redirect: 'follow'})
            .then(res => {
                console.log(res)
                if (res.redirected) {
                    window.location.href = res.url;
                }
            })

    }

    componentDidMount() {
        this.fetchRemoteItems();
    }

    handleDelete = (id, e) => {
        e.preventDefault();
        console.log(id);

        this.deleteRemoteItem(id);
    }

    handleDownload = (id, e) => {
        e.preventDefault();
        console.log(id);

        this.getRemoteItem(id);
    }

    render() {
        let lists = [];
        if (this.state.isLoaded) {
            console.log(this.state.items)
            lists = this.state.items.map((item) =>
                <tr key={item.fileKey}>
                    <td>{item.filename}</td>
                    <td>{item.description}</td>
                    <td>{new Date(item.uploadTime * 1).toLocaleString()}</td>
                    <td>{new Date(item.updateTime * 1).toLocaleString()}</td>
                    <td>
                        <a href="#" onClick={(e) => this.handleDownload(item.filename, e)}>Download</a> <br/>
                        <a href="#" onClick={(e) => this.handleDelete(item.fileKey, e)}>Remove</a> <br/>
                        <a href={"/new?filename=" + item.fileKey}>Modify</a> <br/>
                    </td>
                </tr>
            );
        }
        return (
            <Container className="pb-1 p-5 mb-4 bg-light rounded-3">
                <Table striped>
                    <thead>
                    <tr>
                        <th>File</th>
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
    }
}

export default UploadsTable;

