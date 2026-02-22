let bucles = document.getElementById('bucles');
bucles.addEventListener('submit', function(event) {
event.preventDefault();
let mensaje="";

mensaje="Primer bucle, del 1 al 10... <br>";



function buc1 ()
{
    let bucle1 = "";
    for(let i=0;i<10;i++)
    {
       bucle1+=i +"<br>";        
    }
    return bucle1;
}
mensaje+=buc1();
mensaje+="Bucle con cuadrado usando *. <br>";
/*  //Por eficiencia este da más vueltas en memoria
let cuadrado="";
function cuadrado_lleno(num)
{
    for(let i=0;i<num;i++)
    {
        for (let j=0;j<num;j++)
        {
            cuadrado+="* ";
        }
        cuadrado+="<br>";

    }
    return cuadrado;
}

*/
//Este va a ser más sencillo:

function cuadrado_lleno(num)
{
    let linea="";
    let cuadrado="";
    for (let i=0; i < num; i++){
    
        linea+="* ";
    }
    for(let j=0; j<num;j++){
    
        cuadrado+=linea+"<br>";
    }
    return cuadrado;
}
mensaje+=cuadrado_lleno(4);
function triangulo_izq(num)
{
    let triangulo="";
    let linea="";
    for (let i=0; i<num; i++)
    {
        for (let j=0; j<num; j++)
        {
            
        }
    }
    return triangulo;
}
mensaje+=triangulo_izq(4);
function triangulo_der(num)
{
    for (let altura=0; altura<num; altura++)
    {
        for (let hueco=num; hueco>0;hueco--)
        {}
        for(let asterisco=0; asterisco<num; asterisco++)
        {}
    }
}

let parrafo = document.getElementById('resultado3');
parrafo.innerHTML = mensaje;
});