let formulario2 = document.getElementById('radio');
formulario2.addEventListener('submit', function(event) 
{
     event.preventDefault();
    let num = +document.getElementById('num').value;
     resultado=(Math.pow(num,2))*Math.PI;

    let parrafo = document.getElementById('resultado2');
    parrafo.innerHTML = 'El área del círculo es: ' + resultado.toFixed(2); 
}
);