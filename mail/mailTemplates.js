const confirmationMailBody = ({ name, confirmationCode }) => `</div>
            <h1>Email Verivication</h1>
            <h2>Dear ${name}</h2>
            <p>Please cmplete your signup by clicking the url to confirm your email</p>
            <a href=http://localhost:3000/confirm/${confirmationCode}> Click here</a>
            </div>`;

module.exports = { confirmationMailBody };
