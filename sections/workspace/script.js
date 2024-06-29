// not integrated--- will be added once Profile Section is ready.


// Get the file input and label elements
const fileInput = document.getElementById('file-input');
const fileInputLabel = document.querySelector('.file-input-label');
const profileImage = document.getElementById('profile-image');

// Add an event listener to the file input
fileInput.addEventListener('change', (e) => {
    // Get the selected file
    const file = fileInput.files[0];
    
    // Create a file reader
    const reader = new FileReader();
    
    // Add an event listener to the file reader
    reader.addEventListener('load', () => {
        // Set the profile image src to the file reader result
        profileImage.src = reader.result;
    });
    
    // Read the file
    if (file) {
        reader.readAsDataURL(file);
    }
});
