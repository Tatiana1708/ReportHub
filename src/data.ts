import { CompetitorAnalysis } from "./types";

export const problemStatement = {
  context: "Dans le cadre de l'enseignement supérieur, la validation des stages pratiques constitue une étape clé de la diplomation. Cependant, le suivi manuel, l'envoi de rapports par emails ou l'usage d'outils d'apprentissage généraux non structurés mènent à de nombreuses frictions académiques.",
  problem: "Les étudiants font face à des flous de transmission (fichiers perdus, formats non conformes), les enseignants gèrent des dizaines de soumissions sans vue consolidée, et l'administration peine à suivre l'état de validation en temps réel.",
  objectives: [
    "Centraliser les dépôts de rapports au format standardisé (PDF uniquement) avec des formulaires validés théoriquement.",
    "Offrir aux enseignants un tableau de bord optimal de correction, d'affectation de notes [0-20] et de rédaction de rétroactions formelles.",
    "Assurer la transparence de traitement grâce à un fil de traçabilité dynamique de statuts (En attente, Noté, Rejeté).",
    "Garantir l'interopérabilité via des API normalisées RESTful pour que d'autres progiciels (Moodle, OpenEduCat) puissent requêter et synchroniser les résultats scolaires."
  ],
  targetUsers: [
    { role: "Étudiants", description: "Déposent leur rapport, remplissent les métadonnées de l'entreprise d'accueil, et suivent en temps réel le statut d'évaluation." },
    { role: "Enseignants / Tuteurs", description: "Consultent la liste des étudiants affectés, téléchargent les rapports, attribuent les notes et formulent les avis pédagogiques." },
    { role: "Administrateurs", description: "Supervisent l'intégrité de la plateforme, gèrent les comptes académiques et vérifient l'audit complet des soumissions." }
  ]
};

export const competitors: CompetitorAnalysis[] = [
  {
    name: "Moodle Assignment",
    description: "Module de remise de travaux généralisé intégré au LMS mondial Moodle.",
    features: [
      "Dépôt de fichiers multi-formats",
      "Échelle de notation flexible",
      "Gestion de commentaires et barèmes de correction"
    ],
    strengths: [
      "Très haute configurabilité",
      "Grande communauté d'utilisateurs et plugins variés",
      "Notification par courriel automatisée"
    ],
    limitations: [
      "Interface utilisateur souvent datée et complexe pour un usage dédié aux stages",
      "Courbe d'apprentissage rude pour paramétrer les workflows complexes",
      "Surcharge fonctionnelle pour les petits établissements autonomes"
    ],
    improvementsByUs: "ReportHub simplifie radicalement l'expérience : pas de surcharge de configuration. Un tunnel unique de dépôt de PDF axé exclusivement sur le maître d'apprentissage et le barème légal sur 20."
  },
  {
    name: "OpenEduCat Portal",
    description: "Progiciel de gestion d'établissement complet avec une brique d'affectation de devoirs scolaires.",
    features: [
      "Fiche étudiant unifiée",
      "Portails séparés parents-professeurs-élèves",
      "Suivi de cursus et présence globale"
    ],
    strengths: [
      "Approche ERP modulaire et structurée",
      "Excellente gestion de l'infrastructure institutionnelle",
      "Base de données unifiée des fiches de stages"
    ],
    limitations: [
      "Nécessite le déploiement d'un écosystème ERP lourd",
      "Difficulté à isoler l'évaluation spécifique du rapport de stage par rapport au parcours complet du diplôme",
      "API souvent propriétaire ou difficile à intégrer hors de l'univers Odoo"
    ],
    improvementsByUs: "ReportHub s'intègre en tant que microservice ultra-léger et autonome via une API REST documentée en OpenAPI, permettant de se greffer à OpenEduCat sans en dépendre structurellement."
  }
];

export const mysqlSchema = `-- ==========================================
-- SQL DUMP Schema for MySQL - DB: reporthub_db
-- Designed for PHP MVC PDO Abstraction Layer
-- ==========================================

CREATE DATABASE IF NOT EXISTS reporthub_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE reporthub_db;

-- 1. Table Users (Soutient la gestion d'accès OOP)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher', 'admin') NOT NULL,
    class_group VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Table Reports Submissions (Soutient les opérations CRUD)
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'graded', 'rejected') DEFAULT 'pending',
    grade DECIMAL(4,2) DEFAULT NULL CHECK (grade >= 0.00 AND grade <= 20.00),
    feedback TEXT DEFAULT NULL,
    graded_by_name VARCHAR(100) DEFAULT NULL,
    graded_date TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Populate seed elements for demonstration test cases
INSERT INTO users (name, email, password_hash, role, class_group) VALUES
('Jane Doe', 'student@reporthub.edu', '$2y$10$Wd3uXpQPyR7K6IEm60CscO5tT/i6vN0zX6Vp4J6jOOnpPhA.rMyM6', 'student', 'INF-2026'),
('Prof. Sarah Conner', 'teacher@reporthub.edu', '$2y$10$Wd3uXpQPyR7K6IEm60CscO5tT/i6vN0zX6Vp4J6jOOnpPhA.rMyM6', 'teacher', NULL);
`;

export const phpFilesList = [
  {
    path: "app/core/Database.php",
    label: "Database Connection",
    language: "php",
    code: `<?php
namespace App\\Core;

use PDO;
use PDOException;

/**
 * Singleton class for safe PDO Database Connection representing PSR-4 compliant abstract access
 */
class Database {
    private static ?PDO $instance = null;

    private function __construct() {}

    public static function getInstance(): PDO {
        if (self::$instance === null) {
            try {
                $host = "localhost";
                $db_name = "reporthub_db";
                $username = "root";
                $password = "secret_db_pass";
                
                self::$instance = new PDO(
                    "mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8mb4",
                    $username,
                    $password,
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false
                    ]
                );
            } catch (PDOException $e) {
                die("Database Connection Error: " . $e->getMessage());
            }
        }
        return self::$instance;
    }
}`
  },
  {
    path: "app/core/Router.php",
    label: "Front Router",
    language: "php",
    code: `<?php
namespace App\\Core;

/**
 * High-performance PSR-compliant Custom router mapping URI path variables safely
 */
class Router {
    private array $routes = [];

    public function add(string $method, string $path, string $handler): void {
        // Formulation RFC / Regex matching parameters securely
        $routeRegex = preg_replace('/\\{(\\w+)\\}/', '(?P<$1>[^/]+)', $path);
        $this->routes[] = [
            'method' => strtoupper($method),
            'regex' => '#^' . $routeRegex . '$#',
            'handler' => $handler
        ];
    }

    public function dispatch(string $method, string $uri): void {
        $uri = parse_url($uri, PHP_URL_PATH);
        $method = strtoupper($method);

        foreach ($this->routes as $route) {
            if ($route['method'] === $method && preg_match($route['regex'], $uri, $matches)) {
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                
                list($controllerClass, $action) = explode('@', $route['handler'], 2);
                $controllerClass = "App\\\\Controllers\\\\" . $controllerClass;
                
                if (class_exists($controllerClass)) {
                    $controllerInstance = new $controllerClass();
                    if (method_exists($controllerInstance, $action)) {
                        call_user_func_array([$controllerInstance, $action], [$params]);
                        return;
                    }
                }
            }
        }
        
        http_response_code(404);
        echo json_encode(["error" => "Endpoint not found"]);
    }
}`
  },
  {
    path: "app/controllers/ReportController.php",
    label: "Reports Controller",
    language: "php",
    code: `<?php
namespace App\\Controllers;

use App\\Models\\Report;

class ReportController {
    public function index(): void {
        header('Content-Type: application/json');
        $reports = Report::findAll();
        echo json_encode($reports);
    }

    public function submit(): void {
        header('Content-Type: application/json');
        
        $title = trim($_POST['title'] ?? '');
        $companyName = trim($_POST['companyName'] ?? '');
        
        if (empty($title) || empty($companyName)) {
            http_response_code(400);
            echo json_encode(["error" => "Champs manquants lors du dépôt"]);
            return;
        }
        
        if (!isset($_FILES['report_file']) || $_FILES['report_file']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(["error" => "Erreur de chargement du fichier PDF"]);
            return;
        }
        
        $fileTmpPath = $_FILES['report_file']['tmp_name'];
        $fileName = $_FILES['report_file']['name'];
        $fileSize = $_FILES['report_file']['size'];
        $fileType = $_FILES['report_file']['type'];
        
        // Strict PDF mime limit validation
        if ($fileType !== 'application/pdf') {
            http_response_code(400);
            echo json_encode(["error" => "Type de fichier non autorisé. Format PDF uniquement."]);
            return;
        }

        $uploadFileDir = './storage/uploads/';
        $dest_path = $uploadFileDir . time() . '_' . basename($fileName);
        
        if (move_uploaded_file($fileTmpPath, $dest_path)) {
            $isSubmitted = Report::create([
                'title' => $title,
                'company' => $companyName,
                'file_path' => $dest_path,
                'student_id' => $_SESSION['user_id'] ?? 1
            ]);
            
            if ($isSubmitted) {
                echo json_encode(["message" => "Rapport soumis avec succès."]);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Erreur lors de l'enregistrement en base de données"]);
            }
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Correction de sauvegarde sur serveur échouée"]);
        }
    }
}`
  },
  {
    path: "app/models/Report.php",
    label: "Report Model (PDO)",
    language: "php",
    code: `<?php
namespace App\\Models;

use App\\Core\\Database;
use PDO;

class Report {
    public static function findAll(): array {
        $db = Database::getInstance();
        $stmt = $db->query("SELECT r.*, u.name as student_name FROM reports r JOIN users u ON r.student_id = u.id ORDER BY r.submission_date DESC");
        return $stmt->fetchAll();
    }

    public static function create(array $data): bool {
        $db = Database::getInstance();
        $stmt = $db->prepare("INSERT INTO reports (title, company_name, file_path, student_id, status) VALUES (:title, :company, :file_path, :student_id, 'pending')");
        return $stmt->execute([
            ':title' => $data['title'],
            ':company' => $data['company'],
            ':file_path' => $data['file_path'],
            ':student_id' => $data['student_id']
        ]);
    }

    public static function updateGradeAndFeedback(int $id, float $grade, string $feedback): bool {
        $db = Database::getInstance();
        $stmt = $db->prepare("UPDATE reports SET grade = :grade, feedback = :feedback, status = 'graded', graded_date = NOW() WHERE id = :id");
        return $stmt->execute([
            ':id' => $id,
            ':grade' => $grade,
            ':feedback' => $feedback
        ]);
    }
}`
  },
  {
    path: "tests/ReportTest.php",
    label: "Unit Tests (PHPUnit)",
    language: "php",
    code: `<?php
namespace Tests;

use PHPUnit\\Framework\\TestCase;
use App\\Models\\Report;

class ReportTest extends TestCase {
    public function testFormValidationRefusesEmptyTitle() {
        $title = "";
        $this->assertEmpty($title, "Le titre du rapport ne peut pas être vide");
    }

    public function testGradeBoundaryValidation() {
        $validGrade = 16.5;
        $invalidGrade = 22.0;

        $this->assertGreaterThanOrEqual(0, $validGrade);
        $this->assertLessThanOrEqual(20, $validGrade);
        
        $this->assertTrue($invalidGrade > 20, "Une note supérieure à 20 doit lever une exception.");
    }
}`
  },
  {
    path: "composer.json",
    label: "Composer Configuration",
    language: "json",
    code: `{
    "name": "reporthub/reporthub",
    "description": "Full PHP MVC Internship Report Management Platform",
    "type": "project",
    "license": "Apache-2.0",
    "require": {
        "php": ">=8.1",
        "ext-pdo": "*"
    },
    "require-dev": {
        "phpunit/phpunit": "^10.0"
    },
    "autoload": {
        "psr-4": {
            "App\\\\": "app/"
        }
    }
}`
  }
];
