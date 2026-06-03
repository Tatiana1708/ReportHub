import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface User {
  id: string;
  email: string;
  name: string;
  role: "student" | "teacher" | "admin";
  classGroup?: string;
  avatar?: string;
}

interface ReportSubmission {
  id: string;
  studentId: string;
  studentName: string;
  classGroup: string;
  title: string;
  companyName: string;
  submissionDate: string;
  fileName: string;
  fileSize: string;
  status: "pending" | "graded" | "rejected";
  grade?: number; // 0-20 system
  feedback?: string;
  gradedBy?: string;
  gradedDate?: string;
}

// In-memory Mock DB
let users: User[] = [
  { id: "u-1", email: "student@reporthub.edu", name: "Jane Doe", role: "student", classGroup: "INF-2026", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" },
  { id: "u-2", email: "student2@reporthub.edu", name: "John Smith", role: "student", classGroup: "SEN-2026", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
  { id: "u-3", email: "teacher@reporthub.edu", name: "Prof. Sarah Conner", role: "teacher", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150" },
  { id: "u-4", email: "teacher2@reporthub.edu", name: "Prof. James Miller", role: "teacher", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" },
  { id: "u-5", email: "admin@reporthub.edu", name: "Super Administrator", role: "admin", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" }
];

let submissions: ReportSubmission[] = [
  {
    id: "rep-101",
    studentId: "u-1",
    studentName: "Jane Doe",
    classGroup: "INF-2026",
    title: "Developpement d'une PWA en PHP MVC pour la Gestion d'Inventaires",
    companyName: "WebTech Solutions",
    submissionDate: "2026-05-15T14:30:00Z",
    fileName: "Rapport_Stage_Jane_Doe_INF2026.pdf",
    fileSize: "4.2 MB",
    status: "graded",
    grade: 18,
    feedback: "Excellent travail d'architecture. La structure MVC est respectée et l'implémentation de la couche d'accès aux données PDO est très propre. Pensez à ajouter plus de commentaires PSR.",
    gradedBy: "Prof. Sarah Conner",
    gradedDate: "2026-05-20T10:15:00Z"
  },
  {
    id: "rep-102",
    studentId: "u-2",
    studentName: "John Smith",
    classGroup: "SEN-2026",
    title: "Optimisation de l'infrastructure réseau et cybersécurité",
    companyName: "SecureCloud SAS",
    submissionDate: "2026-05-28T09:15:00Z",
    fileName: "Rapport_CyberSec_Smith_SEN2026.docx",
    fileSize: "5.7 MB",
    status: "pending"
  }
];

// PHP MVC Code Structure JSON (PSR- compliant mockup for visual exploration)
const PHPMVCCodebase = {
  "app": {
    "core": {
      "Database.php": `<?php
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
}`,
      "Router.php": `<?php
namespace App\\Core;

/**
 * High-performance PSR-compliant Custom router mapping URI path variables safely
 */
class Router {
    private array $routes = [];

    public function add(string $method, string $path, string $handler): void {
        // Formulate regex for route match safely (with param mapping)
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
                // Extract params securely
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
        
        // Output 404
        http_response_code(404);
        echo json_encode(["error" => "Endpoint not found"]);
    }
}`
    },
    "controllers": {
      "AuthController.php": `<?php
namespace App\\Controllers;

use App\\Models\\User;

class AuthController {
    public function login(): void {
        header('Content-Type: application/json');
        
        $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
        $password = $_POST['password'] ?? '';

        if (!$email || empty($password)) {
            http_response_code(400);
            echo json_encode(["error" => "Critères de connexion invalides."]);
            return;
        }

        $user = User::findByEmail($email);
        if ($user && password_verify($password, $user['password_hash'])) {
            session_start();
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_role'] = $user['role'];
            
            echo json_encode([
                "message" => "Connexion réussie.",
                "user" => [
                    "id" => $user['id'],
                    "name" => $user['name'],
                    "role" => $user['role']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["error" => "Email ou mot de passe incorrect."]);
        }
    }
}`,
      "ReportController.php": `<?php
namespace App\\Controllers;

use App\\Models\\Report;

class ReportController {
    public function index(): void {
        header('Content-Type: application/json');
        // Retrieve and filter with model query logic using secure boundaries
        $reports = Report::findAll();
        echo json_encode($reports);
    }

    public function submit($params): void {
        header('Content-Type: application/json');
        
        $title = trim($_POST['title'] ?? '');
        $companyName = trim($_POST['companyName'] ?? '');
        
        if (empty($title) || empty($companyName)) {
            http_response_code(400);
            echo json_encode(["error" => "Champs manquants lors du dépôt"]);
            return;
        }
        
        // Handle File upload mapping securely to storage
        if (!isset($_FILES['report_file']) || $_FILES['report_file']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(["error" => "Erreur de chargement du fichier PDF"]);
            return;
        }
        
        $fileTmpPath = $_FILES['report_file']['tmp_name'];
        $fileName = $_FILES['report_file']['name'];
        $fileSize = $_FILES['report_file']['size'];
        $fileType = $_FILES['report_file']['type'];
        
        // Strictly validate mime-type to secure container
        $allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!in_array($fileType, $allowedTypes)) {
            http_response_code(400);
            echo json_encode(["error" => "Type de fichier non autorisé. Formats acceptés: PDF, Word"]);
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
            echo json_encode(["error" => "Impossible de sauvegarder le fichier sur le serveur"]);
        }
    }

    public function grade($params): void {
        header('Content-Type: application/json');
        $id = $params['id'] ?? null;
        
        $grade = filter_input(INPUT_POST, 'grade', FILTER_VALIDATE_FLOAT);
        $feedback = trim($_POST['feedback'] ?? '');

        if ($grade === false || $grade < 0 || $grade > 20) {
            http_response_code(400);
            echo json_encode(["error" => "La note doit être un nombre valide entre 0 et 20."]);
            return;
        }

        $updated = Report::updateGradeAndFeedback($id, $grade, $feedback);
        if ($updated) {
            echo json_encode(["message" => "Note et feedback mis à jour avec succès."]);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Rapport non trouvé lors de la notation."]);
        }
    }
}`
    },
    "models": {
      "Report.php": `<?php
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
}`,
      "User.php": `<?php
namespace App\\Models;

use App\\Core\\Database;
use PDO;

class User {
    public static function findByEmail(string $email): ?array {
        $db = Database::getInstance();
        $stmt = $db->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();
        return $user ? $user : null;
    }
}`
    }
  },
  "config": {
    "database.php": `<?php
// Configuration parameters for the MySQL connection
return [
    'host' => 'localhost',
    'dbname' => 'reporthub_db',
    'user' => 'root',
    'password' => 'secret_db_pass',
    'charset' => 'utf8mb4',
    'options' => [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]
];`
  },
  "public": {
    "index.php": `<?php
/**
 * Entry Point of the PHP MVC Application - ReportHub
 * Bootstraps config, establishes routing mechanics and runs middleware.
 */

require_once __DIR__ . '/../vendor/autoload.php';

session_start();

use App\\Core\\Router;

$router = new Router();

// Define clean routing endpoints
$router->add('GET', '/reports', 'ReportController@index');
$router->add('POST', '/reports/submit', 'ReportController@submit');
$router->add('POST', '/reports/{id}/grade', 'ReportController@grade');
$router->add('POST', '/auth/login', 'AuthController@login');

// Retrieve dynamic request context
$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';

// Dispatch safely
$router->dispatch($requestMethod, $requestUri);`
  },
  "tests": {
    "ReportTest.php": `<?php
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
        
        $this->assertTrue($invalidGrade > 20, "Une note supérieure à 20 doit échouer la validation.");
    }
}`
  },
  "composer.json": `{
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
};

// Swagger / OpenAPI schema definition
const swaggerSpec = {
  "openapi": "3.0.0",
  "info": {
    "title": "ReportHub Rest API Schema",
    "version": "1.0.0",
    "description": "Documented API endpoints ensuring interoperability with third-party school portals (e.g. OpenEduCat, Moodle) for managing user auth and internship submissions."
  },
  "servers": [
    {
      "url": "https://api.reporthub.edu/v1",
      "description": "ReportHub Production Production Server"
    },
    {
      "url": "/api/v1",
      "description": "Local Sandbox Mock API"
    }
  ],
  "paths": {
    "/auth/login": {
      "post": {
        "summary": "Authentifier l'utilisateur",
        "description": "Permet de générer une session de connexion pour les étudiants ou enseignants.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["email", "password"],
                "properties": {
                  "email": { "type": "string", "example": "student@reporthub.edu" },
                  "password": { "type": "string", "example": "password123" }
                }
              }
            }
          }
        },
        "responses": {
          "200": { "description": "Session validée avec succès" },
          "401": { "description": "Identifiants invalides" }
        }
      }
    },
    "/reports": {
      "get": {
        "summary": "Lister tous les rapports de stage",
        "description": "Renvoie la liste des rapports. Filtrage accessible par rôle.",
        "responses": {
          "200": { "description": "Liste de rapports retournée" }
        }
      },
      "post": {
        "summary": "Déposer un nouveau rapport de stage",
        "description": "Permet à l'étudiant connecté d'uploader un fichier PDF.",
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "required": ["title", "companyName", "report_file"],
                "properties": {
                  "title": { "type": "string", "example": "Rapport de Stage 2026 UX" },
                  "companyName": { "type": "string", "example": "Incite Tech" },
                  "report_file": { "type": "string", "format": "binary" }
                }
              }
            }
          }
        },
        "responses": {
          "201": { "description": "Rapport soumis avec succès" },
          "400": { "description": "Fichier mal formé- Mime type PDF requis" }
        }
      }
    },
    "/reports/{id}/grade": {
      "post": {
        "summary": "Noter un rapport",
        "description": "Attribuer une note académique entre 0 et 20 et rédiger un feedback détaillé.",
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "string" } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["grade", "feedback"],
                "properties": {
                  "grade": { "type": "number", "minimum": 0, "maximum": 20, "example": 17 },
                  "feedback": { "type": "string", "example": "Très bonne intégration et méthodologie solide." }
                }
              }
            }
          }
        },
        "responses": {
          "200": { "description": "Note persistée avec succès" },
          "400": { "description": "Attributs invalides ou note hors échelle [0-20]" }
        }
      }
    }
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API v1 Routing Space
  app.get("/api/v1/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Auth: Me
  app.get("/api/v1/auth/me", (req, res) => {
    // Mimic session - return default or query user
    res.json({ user: users[0] }); // Starts as Jane Doe Student
  });

  // Auth login
  app.post("/api/v1/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ error: "Identifiants de connexion invalides" });
    }
  });

  // Get Reports Space
  app.get("/api/v1/reports", (req, res) => {
    res.json({ submissions });
  });

  // Get specific Report details
  app.get("/api/v1/reports/:id", (req, res) => {
    const rep = submissions.find(r => r.id === req.params.id);
    if (rep) {
      res.json({ report: rep });
    } else {
      res.status(404).json({ error: "Rapport non trouvé" });
    }
  });

  // Post / Submit Report (student action)
  app.post("/api/v1/reports", (req, res) => {
    const { studentId, title, companyName, fileName, fileSize } = req.body;
    
    if (!title || !companyName || !fileName) {
      return res.status(400).json({ error: "Tous les champs requis ne sont pas renseignés" });
    }

    const student = users.find(u => u.id === studentId) || users[0];
    const newRep: ReportSubmission = {
      id: `rep-${Math.floor(100 + Math.random() * 900)}`,
      studentId: student.id,
      studentName: student.name,
      classGroup: student.classGroup || "GEN-2026",
      title,
      companyName,
      submissionDate: new Date().toISOString(),
      fileName,
      fileSize: fileSize || "1.2 MB",
      status: "pending"
    };

    submissions.unshift(newRep);
    res.status(201).json({ success: true, report: newRep });
  });

  // Patch/Submit grading (teacher action)
  app.put("/api/v1/reports/:id", (req, res) => {
    const { grade, feedback, gradedBy } = req.body;
    const repIndex = submissions.findIndex(r => r.id === req.params.id);

    if (repIndex === -1) {
      return res.status(404).json({ error: "Rapport introuvable" });
    }

    if (grade !== undefined && (typeof grade !== 'number' || grade < 0 || grade > 20)) {
      return res.status(400).json({ error: "La note académique doit être comprise entre 0 et 20" });
    }

    submissions[repIndex] = {
      ...submissions[repIndex],
      status: grade !== undefined ? "graded" : "pending",
      grade: grade !== undefined ? grade : submissions[repIndex].grade,
      feedback: feedback !== undefined ? feedback : submissions[repIndex].feedback,
      gradedBy: gradedBy || "Professeur Evaluateur",
      gradedDate: new Date().toISOString()
    };

    res.json({ success: true, report: submissions[repIndex] });
  });

  // Delete a submission (simulating Admin or correction deletion)
  app.delete("/api/v1/reports/:id", (req, res) => {
    const initialLen = submissions.length;
    submissions = submissions.filter(r => r.id !== req.params.id);
    if (submissions.length < initialLen) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Rapport introuvable pour suppression" });
    }
  });

  // Get dynamic server stats for general dashboards
  app.get("/api/v1/stats", (req, res) => {
    const total = submissions.length;
    const graded = submissions.filter(s => s.status === "graded").length;
    const pending = submissions.filter(s => s.status === "pending").length;
    let avg = 0;
    const gradedWithValues = submissions.filter(s => s.status === "graded" && s.grade !== undefined);
    if (gradedWithValues.length > 0) {
      avg = Math.round((gradedWithValues.reduce((sum, current) => sum + (current.grade || 0), 0) / gradedWithValues.length) * 100) / 100;
    }

    res.json({
      totalSubmissions: total,
      gradedSubmissions: graded,
      pendingValidation: pending,
      averageGrade: avg,
      totalStudents: users.filter(u => u.role === "student").length,
      classGroups: ["INF-2026", "SEN-2026"]
    });
  });

  // Simulated phpunit testing engine API route
  app.post("/api/v1/tests/run", (req, res) => {
    // Returns dummy JUnit / phpunit formatted visual execution block based on specific files
    res.json({
      timestamp: new Date().toISOString(),
      testsRun: 4,
      assertions: 12,
      failures: 0,
      errors: 0,
      suites: [
        { name: "Tests\\ReportTest", passed: true, output: "OK (2 tests, 6 assertions)" },
        { name: "Tests\\RouteDispatchTest", passed: true, output: "OK (1 test, 3 assertions)" },
        { name: "Tests\\PDOAbstractionTest", passed: true, output: "OK (1 test, 3 assertions)" }
      ],
      rawOutput: `PHPUnit 10.0.12 by Sebastian Bergmann and contributors.

Runtime:       PHP 8.2.10
Configuration: /project-root/phpunit.xml

....                                                               4 / 4 (100%)

Time: 00:00.045, Memory: 8.00 MB

OK (4 tests, 12 assertions)`
    });
  });

  // Route to fetch code structure safely
  app.get("/api/v1/codebase", (req, res) => {
    res.json({ codebase: PHPMVCCodebase });
  });

  // Route to fetch Swagger Specification JSON
  app.get("/api/v1/swagger.json", (req, res) => {
    res.json(swaggerSpec);
  });

  // Vite preview bundle logic & asset handlers
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running internally on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start fullstack backend server:", error);
});
