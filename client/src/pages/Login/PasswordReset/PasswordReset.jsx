import Input from '../../../components/Input';
import { useNavigate } from 'react-router-dom';
import Logo from '../../../assets/logo/Logo.png';
import Background from '../../../assets/background/Background_bu.png';
import { useState } from 'react';
import PropTypes from 'prop-types';

const PasswordReset = ({ onSubmit = () => {} }) => {
  const [stage, setStage] = useState('email');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    switch (stage) {
      case 'email':
        onSubmit(email);
        setStage('verify');
        break;
      case 'verify':
        verificationCode === '123456'
          ? setStage('reset')
          : console.error('Invalid verification code');
        break;
      case 'reset':
        newPassword === confirmPassword
          ? console.log('Password reset successful')
          : console.error('Passwords do not match');
        break;
      default:
        break;
    }
  };

  const handleClose = () => navigate('/login');

  return (
    <main
      className="flex items-center justify-center min-h-screen bg-black/30"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="inset-0 flex items-center justify-center w-1/2 mx-auto">
        <div className="bg-white py-4 rounded-xs shadow-lg w-[40vw] h-[70vh] relative flex flex-col overflow-y-auto">
          <div className="flex justify-end items-center px-6">
            <div
              onClick={handleClose}
              className="flex items-center cursor-pointer"
            >
              <button className="w-5 h-5 bg-red-500 text-white font-bold text-lg rounded-full flex items-center justify-center">
                ×
              </button>
              <span className="text-red-500 font-bold text-lg ml-2">
                Cancel
              </span>
            </div>
          </div>
          <div className="flex flex-col px-14 flex-grow">
            <div className="flex flex-col justify-center items-center pb-10">
              <img src={Logo} alt="BU Logo" className="h-36" />
              <span className="font-bold text-2xl">
                Bicol University College of Engineering
              </span>
            </div>

            {stage === 'email' && (
              <div className="flex flex-col pb-10">
                <span className="font-medium text-2xl">
                  Recover your account
                </span>
                <span className="text-gray-500 pb-8">
                  Please enter your email address to find your account.
                </span>
                <form onSubmit={handleSubmit}>
                  <label
                    htmlFor="forgotEmail"
                    className="font-medium text-lg block mb-2"
                  >
                    Enter your email address
                  </label>
                  <Input
                    type="email"
                    id="forgotEmail"
                    name="forgotEmail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full mb-5 p-4 bg-gray-100 rounded-md block"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#B3E5FC] rounded-md font-bold"
                  >
                    Send Code
                  </button>
                </form>
              </div>
            )}

            {stage === 'verify' && (
              <div className="flex flex-col pb-10">
                <span className="font-medium text-2xl">Verify your code</span>
                <span className="text-gray-500 pb-8">
                  Please enter the verification code sent to your email.
                </span>
                <form onSubmit={handleSubmit}>
                  <label
                    htmlFor="verificationCode"
                    className="font-medium text-lg block mb-2"
                  >
                    Enter verification code
                  </label>
                  <Input
                    type="text"
                    id="verificationCode"
                    name="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    className="w-full mb-5 p-4 bg-gray-100 rounded-md block"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#B3E5FC] rounded-md font-bold"
                  >
                    Verify Code
                  </button>
                </form>
              </div>
            )}

            {stage === 'reset' && (
              <div className="flex flex-col pb-10">
                <span className="font-medium text-2xl">
                  Reset your password
                </span>
                <span className="text-gray-500 pb-8">
                  Please enter your new password below.
                </span>
                <form onSubmit={handleSubmit}>
                  <label
                    htmlFor="newPassword"
                    className="font-medium text-lg block mb-2"
                  >
                    New Password
                  </label>
                  <Input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full mb-5 p-4 bg-gray-100 rounded-md block"
                  />
                  <label
                    htmlFor="confirmPassword"
                    className="font-medium text-lg block mb-2"
                  >
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full mb-5 p-4 bg-gray-100 rounded-md block"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#B3E5FC] rounded-md font-bold"
                  >
                    Reset Password
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
PasswordReset.propTypes = {
  onSubmit: PropTypes.func,
};

export default PasswordReset;
