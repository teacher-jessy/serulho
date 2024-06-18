navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        const scriptProcessor = audioContext.createScriptProcessor(1024, 1, 1);

        analyser.smoothingTimeConstant = 0.3;
        analyser.fftSize = 1024;

        microphone.connect(analyser);
        analyser.connect(scriptProcessor);
        scriptProcessor.connect(audioContext.destination);

        let lastUpdateTime = Date.now();

        scriptProcessor.onaudioprocess = function() {
            const currentTime = Date.now();
            if (currentTime - lastUpdateTime >= 1000) { // Atualiza a cada 1 segundo
                lastUpdateTime = currentTime;

                const array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);

                let values = 0;
                for (let i = 0; i < array.length; i++) {
                    values += array[i];
                }
                const average = values / array.length;
                const decibels = 20 * Math.log10(average);

                document.getElementById('decibels').innerText = decibels.toFixed(2);

                const X = parseFloat(document.getElementById('valueX').value);
                const Y = parseFloat(document.getElementById('valueY').value);

                if (decibels <= X) {
                    document.body.style.backgroundColor = 'green';
                } else if (decibels >= Y) {
                    document.body.style.backgroundColor = 'red';
                } else {
                    document.body.style.backgroundColor = 'yellow';
                }
            }
        };
    })
    .catch(err => console.error('Erro ao acessar o microfone:', err));
