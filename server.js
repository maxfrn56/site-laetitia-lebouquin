// Serveur Express pour Railway avec Resend
const express = require('express');
const { Resend } = require('resend');
const path = require('path');

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware pour parser le JSON
app.use(express.json());
app.use(express.static('.'));

// Route pour servir le site statique
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route pour envoyer l'email
app.post('/api/send-email', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Vérifier que les champs requis sont présents
        if (!name || !email || !message) {
            return res.status(400).json({ 
                error: 'Tous les champs sont requis' 
            });
        }

        // Envoyer l'email via Resend
        const { data, error } = await resend.emails.send({
            from: 'Contact Site <onboarding@resend.dev>', // Remplacez par votre domaine vérifié sur Resend
            to: ['laetitia.lebouquin@gmail.com'], // Email de la cliente
            replyTo: email, // Email de l'expéditeur pour pouvoir répondre
            subject: `Nouveau message de contact - ${name}`,
            html: `
                <h2>Nouveau message de contact</h2>
                <p><strong>Nom :</strong> ${name}</p>
                <p><strong>Email :</strong> ${email}</p>
                <p><strong>Message :</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `
        });

        if (error) {
            console.error('Erreur Resend:', error);
            return res.status(500).json({ 
                error: 'Erreur lors de l\'envoi de l\'email' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Message envoyé avec succès',
            id: data?.id 
        });

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ 
            error: 'Erreur serveur' 
        });
    }
});

// Port par défaut pour Railway
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
