# ReportHub - Plateforme d'Éligibilité et Soumission de Rapports de Stage

ReportHub est une application web moderne conçue pour simplifier, centraliser et harmoniser le processus académique de dépôt d'évaluation des rapports de stage de fin d'études. Inspirée par Moodle Assignment et OpenEduCat, elle isole ce besoin spécifique pour offrir un parcours utilisateur optimal et une interopérabilité totale via des API REST standardisées et OpenAPI/Swagger.

Chaque groupe projet de l'établissement bénéficie d'un environnement de validation robuste respectant l'architecture PHP MVC avec PDO d'accès aux données, respectant les recommandations PSR et la programmation orientée objet (OOP).

---

## 1. Contexte, Problématique & Objectifs

### Problématique
La validation des stages est un pilier de la diplomation. Cependant, l'usage de courriels informels ou d'outils d'apprentissage trop complexes crée une surcharge de traitement :
- **Frictions étudiants :** Absence de filtre sur le format des fichiers (.pdf), dépôts égarés, manque de suivi de la correction.
- **Frictions enseignants :** Séquences de notation hétérogènes, manque d'unanimité sur le barème et difficulté de formuler des rétroactions d'apprentissage centralisées.
- **Défaut d'intégration :** Les notes ne remontent pas spontanément vers les hubs administratifs (LMS scolaires).

### Objectifs stratétigiques
1. **Centralisation complète :** Unifier tous les dépôts au format PDF standardisé.
2. **Dashboard d'évaluation :** Assister les enseignants dans la saisie des notes académiques (plage `[0-20]`) et des commentaires rétroactifs.
3. **Statut d'étape dynamique :** Fournir une traçabilité transparente (⏳ En attente, ✅ Noté, ❌ Rejeté).
4. **Interconnexion standardisée :** Exposer des spec OpenAPI/Swagger pour une synchronisation tierce directe.

---

## 2. Analyse de l'existant (Benchmark)

### A. Moodle Assignment
* **Description :** Option de remise de travaux décentralisée intégrée au LMS Moodle.
* **Forces :** Hautement paramétrable, notifications par e-mails automatiques, support à grande échelle.
* **Faiblesses :** Surcharge cognitive pour les enseignants, interface confuse et peu propice à un tunnel de stage exclusif.
* **Apport de ReportHub :** ReportHub retire toute surcharge de configuration en créant un tunnel unique axé sur le rapport d'entreprise avec les indicateurs académiques de promotion.

### B. OpenEduCat Portal
* **Description :** Suite intégrée de gestion scolaire modulaire type ERP.
* **Forces :** Modélisation d'accès parents/professeurs, fiches élèves unifiées, intégrité d'inscription.
* **Faiblesses :** Client lourd dépendant du déploiement généralisé de l'écosystème ERP d'Odoo, intégration API fastidieuse.
* **Apport de ReportHub :** ReportHub se connecte en microservice indépendant et expose une API REST ultra-légère, facilitant le déploiement.

---

## 3. Schéma de Base de Données (MySQL & PDO)

Le diagramme d'entités-associations (ERD) est structuré autour de deux tables à hautes contraintes :

```sql
-- users: Comptes de l'établissement
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher', 'admin') NOT NULL,
    class_group VARCHAR(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- reports: Soumissions de stages
CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'graded', 'rejected') DEFAULT 'pending',
    grade DECIMAL(4,2) DEFAULT NULL CHECK (grade >= 0.00 AND grade <= 20.00),
    feedback TEXT DEFAULT NULL,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 4. Architecture de l'Application PHP MVC

L'application respecte l'arborescence recommandée pour un framework orienté objet :

```text
/project-root
├── app/
│   ├── core/
│   │   ├── Database.php   <-- Singleton PDO pour l'accès sécurisé à MySQL
│   │   └── Router.php     <-- Routage par regex et extraction dynamique de variables
│   ├── controllers/
│   │   ├── AuthController.php   <-- Session & validation de mot de passe haché
│   │   └── ReportController.php <-- Gestion CRUD des fichiers & stockage serveur
│   ├── models/
│   │   ├── User.php       <-- Requêtes préparées d'identification
│   │   └── Report.php     <-- Requêtes préparées d'INSERT/UPDATE de notes
│   └── views/             <-- Templates HTML réutilisables
│
├── config/
│   └── database.php       <-- Configurations locales de connexion
├── public/
│   ├── index.php          <-- Point d'entrée de l'application (Bootstrap)
│   └── assets/            <-- Assets CSS & JS légers
├── tests/
│   └── ReportTest.php     <-- Cas de validation de formulaire unitaires PHPUnit
├── composer.json          <-- Déclaration PSR-4 d'Autoloading
└── README.md
```

---

## 5. Spécifications & Interopérabilité REST API (OpenAPI/Swagger)

ReportHub expose 4 endpoints RESTful validés en sandbox :

1. `POST /api/v1/auth/login` : Connecte l'utilisateur d'après ses credentials.
2. `GET /api/v1/reports` : Liste tous les documents soumis pour examen.
3. `POST /api/v1/reports` : Soumet à distance un document PDF et l'associe à l'étudiant.
4. `PUT /api/v1/reports/{id}` : Noter un rapport avec validation de limites `[0-20]`.

---

## 6. Lancement & Exécution des Tests

Les tests unitaires garantissent qu'aucune régression fonctionnelle ne survienne :
- Exécution de commandes tests (Mocks de PHPUnit intégrés).
- Test de limites de notes (ex: rejet de note `22/20`).
- Test de désinfection de caractères spéciaux sur le titre du document.
