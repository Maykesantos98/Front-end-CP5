// --- EFEITO DO MENU ---
        const header = document.getElementById('main-header');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('menu-transparent');
            } else {
                header.classList.remove('menu-transparent');
            }
        });

        // --- LÓGICA DO PLAYER DE MÚSICA COM API DO DEEZER ---
        const playBtn = document.getElementById('play'); // Botão de play/pause
        const prevBtn = document.getElementById('prev');  // Botão de musica anterior
        const nextBtn = document.getElementById('next'); // Botão de proxima musica
        
        const audio = document.getElementById('audio'); // Elemento de audio HTML5
        const progress = document.getElementById('progress'); // Barra de progresso
        const progressContainer = document.getElementById('progress-container'); // Container da barra de progresso
        const title = document.getElementById('title'); // Título da música
        const artist = document.getElementById('artist'); // Artista da música
        const cover = document.getElementById('cover'); // Capa da música
        const playlistContainer = document.getElementById('playlist-container'); // Container da playlist

        const searchForm = document.getElementById('search-form'); // Formulário de busca
        const searchInput = document.getElementById('search-input'); // Input de busca

        let songs = []; 
        let songIndex = 0; // Índice da música atual
        
        function handleDeezerResponse(response) { // Callback para JSONP
            // Verifica se a resposta contém uma playlist ou resultados de busca
            const tracks = response.tracks ? response.tracks.data : response.data;

            if (!tracks || tracks.length === 0) { 
                playlistContainer.innerHTML = '<p class="text-center text-gray-400">Nenhuma música encontrada.</p>';
                title.innerText = "Sem resultados";
                artist.innerText = "Tente outra busca";
                cover.src = 'https://e-cdns-images.dzcdn.net/images/cover/default-album-400x400.jpg';
                songs = []; // Limpa a lista de músicas
                return;
            } // Se não houver músicas, exibe mensagem

            songs = tracks.map(track => {
                return {
                    title: track.title_short,
                    artist: track.artist.name,
                    src: track.preview,
                    cover: track.album.cover_medium
                };
            }); // Mapeia os dados da API para o formato necessário
            
            songIndex = 0;
            loadSong(songs[songIndex]);
            renderPlaylist();
            pauseSong();
        } 

        function fetchInitialPlaylist() {
            const playlistID = '948759923'; // Ex: Playlist "Top Brasil"
            const script = document.createElement('script');
            script.src = `https://api.deezer.com/playlist/${playlistID}?output=jsonp&callback=handleDeezerResponse`;
            document.head.appendChild(script);
        } // Busca a playlist inicial

        function searchTracks(query) {
            const script = document.createElement('script');
            script.src = `https://api.deezer.com/search/track?q=${encodeURIComponent(query)}&output=jsonp&callback=handleDeezerResponse`;
            document.head.appendChild(script);
        } // Busca músicas com base na query

        function loadSong(song) {
            if (!song) return;
            title.innerText = song.title;
            artist.innerText = song.artist;
            audio.src = song.src;
            cover.src = song.cover;
        } // Carrega a música atual

        function renderPlaylist() {
            playlistContainer.innerHTML = '';
            songs.forEach((song, index) => {
                const isActive = index === songIndex;
                const activeClass = isActive ? 'active' : '';
                const playlistItem = document.createElement('div');
                playlistItem.className = `playlist-item p-3 rounded-md cursor-pointer flex justify-between items-center hover:bg-gray-700 ${activeClass}`;
                playlistItem.innerHTML = `
                    <div>
                        <p class="font-semibold">${song.title}</p>
                        <p class="text-sm text-gray-400">${song.artist}</p>
                    </div>
                    <i class="fas ${isActive && !audio.paused ? 'fa-pause' : 'fa-play'} text-teal-400"></i>
                `;
                playlistItem.addEventListener('click', () => {
                    songIndex = index;
                    loadSong(songs[songIndex]);
                    playSong();
                });
                playlistContainer.appendChild(playlistItem);
            });
        } // Renderiza a playlist na interface

        function playSong() {
            if (!songs.length) return;
            audio.play();
            playBtn.querySelector('i.fas').classList.remove('fa-play');
            playBtn.querySelector('i.fas').classList.add('fa-pause');
            renderPlaylist();
        } // Toca a música atual

        function pauseSong() {
            audio.pause();
            playBtn.querySelector('i.fas').classList.remove('fa-pause');
            playBtn.querySelector('i.fas').classList.add('fa-play');
            renderPlaylist();
        } // Pausa a música atual
        
        function prevSong() {
            if (!songs.length) return;
            songIndex--;
            if (songIndex < 0) {
                songIndex = songs.length - 1;
            }
            loadSong(songs[songIndex]);
            playSong();
        } // Vai para a música anterior

        function nextSong() {
            if (!songs.length) return;
            songIndex++;
            if (songIndex > songs.length - 1) {
                songIndex = 0;
            }
            loadSong(songs[songIndex]);
            playSong();
        } // Vai para a próxima música

        function updateProgress(e) {
            const { duration, currentTime } = e.srcElement;
            const progressPercent = (currentTime / duration) * 100;
            progress.style.width = `${progressPercent}%`;
        } // Atualiza a barra de progresso
        
        function setProgress(e) {
            const width = this.clientWidth;
            const clickX = e.offsetX;
            const duration = audio.duration;
            if (duration) {
                audio.currentTime = (clickX / width) * duration;
            }
        } // Define a posição da música com base no clique na barra de progresso

        // Event Listeners
        playBtn.addEventListener('click', () => {
            const isPlaying = playBtn.querySelector('i.fas').classList.contains('fa-pause');
            isPlaying ? pauseSong() : playSong();
        }); // Alterna entre play e pause

        prevBtn.addEventListener('click', prevSong);
        nextBtn.addEventListener('click', nextSong);
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', nextSong);
        progressContainer.addEventListener('click', setProgress);
        
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                playlistContainer.innerHTML = '<p class="text-center text-gray-400">Buscando...</p>';
                searchTracks(searchTerm);
            }
        }); // Lida com o envio do formulário de busca

        // Inicia o processo buscando a playlist inicial
        fetchInitialPlaylist(); // Busca a playlist inicial