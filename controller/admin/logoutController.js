const loadLogout = async (req, res) => {
    try {
        
        if (req.session && req.session.admin) {
            delete req.session.admin
            setTimeout(() => {
                res.redirect('/admin');
            }, 1500);
            
        }
        
    } catch (error) {
        console.error('loadLogout error:', error.message);
        return res.status(404).render("404");

    }
};

module.exports={
    loadLogout}