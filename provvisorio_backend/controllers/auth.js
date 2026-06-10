const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const login = async (req, res) => {
  try {
    // TODO:
    // 1. Estrai username e password da req.body
    const { username, password } = req.body;
    
    // 2. Cerca l'admin nel DB per username
    const admin = await Admin.findOne({ username });
    
    // 3. Se non esiste, ritorna 401 { ok: false, message: 'Credenziali non valide' }
    if (!admin) {
      return res.status(401).json({ ok: false, message: "Credenziali non valide" });
    }
    
    // 4. Compara la password con admin.comparePassword(password)
    const isPasswordValid = await admin.comparePassword(password);
    
    // 5. Se non corrisponde, ritorna 401
    if (!isPasswordValid) {
      return res.status(401).json({ ok: false, message: "Credenziali non valide" });
    }
    
    // 6. Se tutto ok, ritorna { ok: true, token: generateToken(admin._id) }
    res.json({ ok: true, token: generateToken(admin._id) });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

const me = async (req, res) => {
  try {
    // TODO:
    // 1. req.user.id contiene l'id dell'admin (settato dal middleware auth)
    // 2. Cerca l'admin per id, senza il campo password
    const admin = await Admin.findById(req.user.id).select('-password');
    
    // 3. Ritorna l'admin
    if (!admin) {
      return res.status(404).json({ ok: false, message: "Admin non trovato" });
    }
    
    res.json({ ok: true, admin });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

module.exports = { login, me };
