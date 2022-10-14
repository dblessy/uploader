import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import {Outlet} from "react-router-dom";
import Login from "./Login";

function TopNav() {
    return (
        <>
        <Navbar bg="light" expand="lg">
            <Container>
                <Navbar.Brand href="#home">Uploader</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="/">Home</Nav.Link>
                        <Nav.Link href="/uploads">My Uploads</Nav.Link>
                        <Nav.Link href="/new">New</Nav.Link>
                        <Nav.Link href="/admin">Admin</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
                <Login/>
            </Container>
        </Navbar>
        <Outlet />
        </>
    );
}

export default TopNav;