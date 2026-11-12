import React from "react";
import { Link } from "react-router";
import ThemeToggle from "~/components/ThemeToggle";

const Navbar = () => {
    return (
        <div className="navbar">
            <Link to="/">
                <p className="text-2xl font-bold text-gradient">RESUMAIN</p>
            </Link>
            <ThemeToggle />
            <Link to="/upload">
                <p className="primary-button w-fit">Upload Resume</p>
            </Link>
        </div>
    );
};

export default Navbar;