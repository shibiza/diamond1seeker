// 1. Function with optional parameter
function greetTs(name : string, age?: number){
    if (age != null) {
         return "Hello " + name + ", you are " + age + " years old!";
    }
    else{
          return "Hello, " + name + "!";
    }
}

console.log(greetTs("Alex", 13));
console.log(greetTs("Nata"));



// 2. Function with default parameter
function getFullName(firstName: string, lastname: string){
    return `${firstName} ${lastname.toUpperCase()}`;
}

console.log(getFullName("John", "One"));
console.log(getFullName("onlyNameInvalid"));



// 3. Function with return type
function checkAdult(age: number):boolean {
    return age >= 18;
}

console.log(checkAdult(13));
console.log(checkAdult(20));



// 4. Function with arrow syntax
const calculatorTS = (a: number, b: number): number => {
    return a + b;
}
console.log(calculatorTS(1, 2));
console.log(calculatorTS(1, 2, three));


// 5. accessing non existing properties
const personTS = {
    name: "John",
    age: 20,
}
console.log(personTS.name);
console.log(personTS.age);
console.log(personTS.email);


// 6. accessing non existing properties
const personTS = {
    name: "John",
    age: 20,
}
console.log(personTS.name);
console.log(personTS.age);
console.log(personTS.email);
console.log(personTS.email.length);