// Function to generate a random profile picture URL
function getRandomProfilePicture() {
    var profilePictures = [
        'https://via.placeholder.com/50?text=PFP1',
        'https://via.placeholder.com/50?text=PFP2',
        'https://via.placeholder.com/50?text=PFP3'
    ];
    var randomIndex = Math.floor(Math.random() * profilePictures.length);
    return profilePictures[randomIndex];
}

// Function to add a comment
function addComment() {
    var commentText = document.getElementById("comment-text").value;
    if (commentText.trim() !== "") {
        var commentElement = document.createElement("div");
        commentElement.classList.add("comment");

        var profilePicture = document.createElement("img");
        profilePicture.src = getRandomProfilePicture();
        profilePicture.alt = "Profile Picture";

        var commentContent = document.createElement("p");
        commentContent.textContent = commentText;

        commentElement.appendChild(profilePicture);
        commentElement.appendChild(commentContent);

        document.getElementById("comments-list").appendChild(commentElement);
        document.getElementById("comment-text").value = "";

        // Save comment to local storage
        saveComment(commentText);
    } else {
        alert("Please enter a comment.");
    }
}

// Function to save a comment to local storage
function saveComment(commentText) {
    var comments = JSON.parse(localStorage.getItem("comments")) || [];
    comments.push(commentText);
    localStorage.setItem("comments", JSON.stringify(comments));
}

// Function to load comments from local storage
function loadComments() {
    var comments = JSON.parse(localStorage.getItem("comments")) || [];
    var commentsList = document.getElementById("comments-list");
    comments.forEach(function(commentText) {
        var commentElement = document.createElement("div");
        commentElement.classList.add("comment");

        var profilePicture = document.createElement("img");
        profilePicture.src = getRandomProfilePicture();
        profilePicture.alt = "Profile Picture";

        var commentContent = document.createElement("p");
        commentContent.textContent = commentText;

        commentElement.appendChild(profilePicture);
        commentElement.appendChild(commentContent);

        commentsList.appendChild(commentElement);
    });
}

// Load comments when the page loads
window.onload = loadComments;
