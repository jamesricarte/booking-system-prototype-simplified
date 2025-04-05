import React from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button";
import Input from "../../components/Input";

const Dashboard = () => {
  return (
    <main className="container w-full h-full px-4 mx-auto bg-white">
      <div className="mb-96">
        <Link>Today's Schedule Bookings</Link>
        <Link>Available Rooms</Link>
        <Link>Weekly Overview</Link>
        <Link>Quick Actions Shortcut</Link>
      </div>

      <div className="flex flex-col gap-4">
        <Button name="login">Login</Button>
        <Button name="signup">Sign Up</Button>
        <Input type="text" name="email" placeholder="Enter your email">
          Enter your email
        </Input>
      </div>
    </main>
  );
};

export default Dashboard;
