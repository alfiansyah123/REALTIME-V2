<?php
// deploy-php/db_update_click_random.php
require_once 'api/config.php';

try {
    echo "Adding 'external_id' column to 'click' table...\n";
    
    // Check if column exists first to avoid error
    $stmt = $pdo->query("SHOW COLUMNS FROM click LIKE 'external_id'");
    if ($stmt->rowCount() == 0) {
        $sql = "ALTER TABLE click ADD COLUMN external_id VARCHAR(64) DEFAULT NULL AFTER id";
        $pdo->exec($sql);
        
        $sqlIndex = "ALTER TABLE click ADD INDEX (external_id)";
        $pdo->exec($sqlIndex);
        
        echo "Success: Column 'external_id' added with index.\n";
    } else {
        echo "Info: Column 'external_id' already exists.\n";
    }
    
} catch (PDOException $e) {
    die("Error: " . $e->getMessage() . "\n");
}
?>
