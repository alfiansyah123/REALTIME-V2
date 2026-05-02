<?php
// reset_password.php
// This is a utility script to reset the 'admin' password to '123456'
require 'api/config.php';

try {
    $newPassword = '123456';
    $newHash = password_hash($newPassword, PASSWORD_DEFAULT);

    // Check if admin exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = 'admin' LIMIT 1");
    $stmt->execute();
    $user = $stmt->fetch();

    if ($user) {
        $updateStmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
        $updateStmt->execute([$newHash, $user['id']]);
        echo "<h1>Success!</h1>";
        echo "<p>Password admin telah direset menjadi: <b>$newPassword</b></p>";
    } else {
        // Create admin if not exists
        $insertStmt = $pdo->prepare("INSERT INTO users (username, password) VALUES ('admin', ?)");
        $insertStmt->execute([$newHash]);
        echo "<h1>Success!</h1>";
        echo "<p>User 'admin' dibuat dengan password: <b>$newPassword</b></p>";
    }
    
    echo "<p><b style='color:red;'>PENTING:</b> Hapus file ini (reset_password.php) setelah digunakan demi keamanan.</p>";
    echo "<a href='/login'>Ke Halaman Login</a>";

} catch (\PDOException $e) {
    echo "<h1>Error!</h1>";
    echo "<p>Database error: " . $e->getMessage() . "</p>";
}
?>
