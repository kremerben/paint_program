
<?php
	// requires php5
	define('UPLOAD_DIR', 'images/');
	$img = $_POST['base64data'];

	$img = str_replace('data:image/png;base64,', '', $img);
	$img = str_replace(' ', '+', $img);

	$data = base64_decode($img);

/*
	$file = UPLOAD_DIR . uniqid() . '.png';
	$success = file_put_contents($file, $data);
	print $success ? $file : 'Unable to save the file.';
*/

file_put_contents('img.png', $data);


?>
