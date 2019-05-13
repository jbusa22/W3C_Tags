var ctx = document.getElementById('myChart');
$.ajax({
    url: "/testing.js",
    method: "POST",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: makeChart(data)
});
function makeChart(data) {
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: tagnames,
            datasets: [{
                label: '# of Votes',
                data: tagdata,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}