const clientId = "ac0c58457e4946f8b3404da9992c9ee7"; // Replace with your client ID
const params = new URLSearchParams(window.location.search);
var code = params.get("code");
const userId = undefined

if (!code) {
    redirectToAuthCodeFlow(clientId);
} else {
    const accessToken = await getAccessToken(clientId, code);
    const profile = await fetchProfile(accessToken);
    getPLaylists(profile.id, accessToken)
    populateUI(profile);
}

async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://127.0.0.1:5173/");
    params.append("scope", "user-read-private user-read-email");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

async function getAccessToken(clientId, code) {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://127.0.0.1:5173/");
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    return access_token;
}

async function fetchProfile(token) {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

function populateUI(profile) {
    console.log(profile)
    document.getElementById("displayName").innerText = profile.display_name;
    if (profile.images[0]) {
        const profileImage = new Image(200, 200);
        profileImage.src = profile.images[0].url;
        document.getElementById("avatar").appendChild(profileImage);
        document.getElementById("imgUrl").innerText = profile.images[0].url;
    }
    document.getElementById("id").innerText = profile.id;
    document.getElementById("email").innerText = profile.email;
    document.getElementById("uri").innerText = profile.uri;
    document.getElementById("uri").setAttribute("href", profile.external_urls.spotify);
    document.getElementById("url").innerText = profile.href;
    document.getElementById("url").setAttribute("href", profile.href);
}

async function getPLaylists(userId, token){
    const result = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists?offset=0&limit=20`, {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    const playlists = await result.json();
    console.log(playlists);
    populatePlaylistDiv(playlists);
}

function populatePlaylistDiv(playlists) {
    const playlistDiv = document.getElementById('playlistDiv');
    const ul = document.createElement('ul');
  
    playlists.items.forEach(playlist => {
      const li = document.createElement('li');
  
      // Adicionar o atributo 'data-pl_id' com o ID da playlist
      li.setAttribute('data-pl_id', playlist.id);
      li.setAttribute('data-name', playlist.name);
  
      // Adicionar a imagem da playlist
      const img = document.createElement('img');
      img.src = playlist.images[0].url; // Use a primeira imagem da lista de imagens (se houver)
      img.alt = playlist.name;
      li.appendChild(img);
  

      ul.appendChild(li);
    });
  
    playlistDiv.appendChild(ul);
  }


function logOut(){
    code = undefined;
    window.location = 'http://127.0.0.1:5173/'
}