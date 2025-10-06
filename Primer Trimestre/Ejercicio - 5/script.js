let formulario = document.getElementById('numeros');
formulario.addEventListener('submit', function(event) 
{
    event.preventDefault();
    let num1 = +document.getElementById('num1').value;
    let num2 = +document.getElementById('num2').value;
    let num3 = +document.getElementById('num3').value;
    
    if(num1 > num2&& num1 > num3)
    {
        resultado=","+num1;
        if(num2>num3)
        {
            resultado+=","+num2;
            resultado+=","+num3;
        }
        else
        {
            resultado+=","+num3;
            resultado+=","+num2;
        }
    }    
    else if(num2 > num1 && num2 > num3)
    {
        resultado=","+num2;
        if(num1 > num3)
        {
            resultado+=num1;
            resultado+=num3;
        }
        else
        {
            resultado+=num3;
            resultado+=num1;
        }   
    }
    else
    {
        resultado=num3;
        if(num1 > num2)
        {
            resultado+=","+num1;
            resultado+=","+num2;
        }
        else
        {
            resultado+=","+num2;
            resultado+=","+num1;
        }   
    }

    let parrafo = document.getElementById('resultado');
    parrafo.innerHTML = 'Los numeros ordenados de mayor a menor son: ' + resultado;
}

);
    