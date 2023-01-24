
exports.getDashboard = (req, res, next) => {
    let userName = req.session.user.username;

    res.render('user/dashboard', { userName });
    const token = req.session.authToken;
    console.log('dahboard token :' + token);
}