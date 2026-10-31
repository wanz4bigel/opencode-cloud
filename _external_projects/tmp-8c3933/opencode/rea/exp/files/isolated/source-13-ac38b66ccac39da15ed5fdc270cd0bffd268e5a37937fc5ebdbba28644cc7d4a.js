
document.addEventListener('DOMContentLoaded', function() {
  // Ambil hash dari URL (misal: #payouts)
  var hash = window.location.hash;
  
  if (hash) {
    // Bersihkan karakter '#'
    var tabId = hash.replace('#', '');
    
    // Cari elemen Tab Pane berdasarkan ID
    var targetPane = document.getElementById(tabId);
    
    if (targetPane) {
      // Dapatkan indeks dari Tab Pane tersebut
      var paneIndex = Array.from(targetPane.parentNode.children).indexOf(targetPane);
      
      // Cari komponen Tabs pembungkusnya
      var tabsComponent = targetPane.closest('.w-tabs');
      
      if (tabsComponent && paneIndex !== -1) {
        // Cari Tab Link yang sesuai dengan indeks tersebut lalu trigger klik
        var targetTabLink = tabsComponent.querySelectorAll('.w-tab-link')[paneIndex];
        if (targetTabLink) {
          targetTabLink.click();
        }
      }
    }
  }
});
