import React from 'react';
import TopNav from "./TopNav";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "./Home";
import MyUploads from "./MyUploads";
import NoPage from "./404";
import Admin from "./Admin";
import New from "./New";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<TopNav/>}>
                    <Route index element={<Home/>}/>
                    <Route path="uploads" element={<MyUploads/>}/>
                    <Route path="new" element={<New/>}/>
                    <Route path="admin" element={<Admin/>}/>
                    <Route path="*" element={<NoPage/>}/>
                </Route>
            </Routes>
        </BrowserRouter>

    );
}

export default App;
