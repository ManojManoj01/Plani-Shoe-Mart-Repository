$repoPath = "D:\Shoe Shop\Shoe_Shop\src\main\java\com\stepstyle\repository\ProductRepository.java"
$serviceImplPath = "D:\Shoe Shop\Shoe_Shop\src\main\java\com\stepstyle\service\impl\ProductServiceImpl.java"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# Remove BOM from ProductRepository.java
$repoText = [System.IO.File]::ReadAllText($repoPath)
$repoText = $repoText.TrimStart([char]0xFEFF)
[System.IO.File]::WriteAllText($repoPath, $repoText, $utf8NoBom)
Write-Host "Removed BOM from ProductRepository.java"

# Remove BOM from ProductServiceImpl.java
$serviceText = [System.IO.File]::ReadAllText($serviceImplPath)
$serviceText = $serviceText.TrimStart([char]0xFEFF)
[System.IO.File]::WriteAllText($serviceImplPath, $serviceText, $utf8NoBom)
Write-Host "Removed BOM from ProductServiceImpl.java"

# Compile backend classes using maven
Write-Host "Compiling Spring Boot backend..."
& "D:\Shoe Shop\Shoe_Shop\apache-maven-3.9.9\bin\mvn.cmd" compile -f "D:\Shoe Shop\Shoe_Shop\pom.xml" -DskipTests
