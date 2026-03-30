const registeredPCs = [
  { mac: 'MacAddress', name: 'PCName', ip: 'LocalIP' },,
];

// 現在のホストを動的に取得（localhost -> サーバーのIPに変更）
const baseURL = `${location.protocol}//${location.hostname}:3000`;

function renderPCs() {
  const pcList = document.getElementById('pcList');
  pcList.innerHTML = '';

  registeredPCs.forEach(pc => {
    const card = document.createElement('div');
    card.classList.add('pc-card');
    card.setAttribute('data-mac', pc.mac);
    card.setAttribute('data-ip', pc.ip);

    const info = document.createElement('div');
    info.innerHTML = `<strong>${pc.name}</strong><br>MAC: ${pc.mac}<br>IP: ${pc.ip}`;

    const status = document.createElement('div');
    status.classList.add('status');
    status.textContent = '状態: 未確認';

    const wakeBtn = document.createElement('button');
    wakeBtn.textContent = '起動';
    wakeBtn.onclick = () => wakeOnLan(pc.mac, pc.ip, card, status);

    card.appendChild(info);
    card.appendChild(status);
    card.appendChild(wakeBtn);

    pcList.appendChild(card);
  });
}

function wakeOnLan(macAddress, ipAddress, card, status) {
  // 起動時に背景リセット
  card.classList.remove('up');
  status.textContent = '状態: 起動試行中...';

  fetch(`${baseURL}/wake`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ macAddress })
  })
    .then(res => res.json())
    .then((data) => {
      console.log("Wake-on-LANレスポンス:", data);

      // 無限にPing（成功したら止める）
      const intervalId = setInterval(() => {
        pingPc(ipAddress, card, status, () => {
          clearInterval(intervalId); 
        });
      }, 5000);
    })
    .catch((error) => {
      console.error("Wake-on-LANエラー:", error);
      status.textContent = `エラー: ${error.message}`;
    });
}

function pingPc(ipAddress, card, status, onSuccess = null) {
  fetch(`${baseURL}/ping`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ipAddress })
  })
    .then(res => res.json())
    .then(data => {
      console.log("Ping結果:", data);

      const message = data.message || data;

      if (message.includes('起動しています')) {
        status.textContent = '状態: 起動完了';
        card.classList.add('up');
        if (onSuccess) onSuccess();
      } else {
        // 起動していない間は「起動中...」を維持
        status.textContent = '状態: 起動中...';
      }
    })
    .catch((error) => {
      console.error("Pingエラー:", error);
      status.textContent = `エラー: ${error.message}`;
    });
}

renderPCs();
