import { program } from 'commander';
import fs from 'fs';
import chalk from 'chalk';

// Función para leer los gastos desde el archivo JSON
function readExpenses() {
  try {
    const data = fs.readFileSync('data/expenses.json');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Función para guardar los gastos en el archivo JSON
function saveExpenses(expenses) {
  fs.writeFileSync('data/expenses.json', JSON.stringify(expenses, null, 2));
}

// Función para agregar un gasto
function addExpense(description, amount) {
  const expenses = readExpenses();
  const newExpense = {
    id: expenses.length + 1,
    description,
    amount,
    date: new Date().toISOString().slice(0, 10),
    category: 'Otro'
  };
  expenses.push(newExpense);
  saveExpenses(expenses);
  console.log(chalk.green('Gasto agregado exitosamente'));
}

// Función para listar los gastos
function listExpenses() {
    const expenses = readExpenses();
    if (expenses.length === 0) {
      console.log(chalk.yellow('No hay gastos registrados.'));
    } else {
      console.log(chalk.bold('Lista de Gastos:'));
      expenses.forEach((expense) => {
        console.log(
          `ID: ${expense.id} | Descripción: ${expense.description} | Monto: $${expense.amount} | Fecha: ${expense.date} | Categoría: ${expense.category}`
        );
      });
    }
  }

  // Función para actualizar un gasto
function updateExpense(id, newDescription, newAmount, newCategory) {
    const expenses = readExpenses();
    const expenseIndex = expenses.findIndex(expense => expense.id === id);
  
    if (expenseIndex !== -1) {
      expenses[expenseIndex].description = newDescription || expenses[expenseIndex].description;
      expenses[expenseIndex].amount = newAmount || expenses[expenseIndex].amount;
      expenses[expenseIndex].category = newCategory || expenses[expenseIndex].category;
      saveExpenses(expenses);
      console.log(chalk.green('Gasto actualizado exitosamente'));
    } else {
      console.log(chalk.red('Gasto no encontrado.'));
    }
  }

//Función para eliminar un gasto
function deleteExpense(id) {
    const expenses = readExpenses();
    const expenseIndex = expenses.findIndex(expense => expense.id === id);
  
    if (expenseIndex !== -1) {
      expenses.splice(expenseIndex, 1);
      saveExpenses(expenses);
      console.log(chalk.green('Gasto eliminado exitosamente'));
    } else {
      console.log(chalk.red('Gasto no encontrado.'));
    }
  }

// Función para mostrar el resumen de gastos
function summaryExpenses() {
  const expenses = readExpenses();

  // Calcular el total general
  const total = expenses.reduce((acc, expense) => acc + parseFloat(expense.amount), 0);

  // Agrupar gastos por categoría y calcular estadísticas
  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = acc[expense.category] || {
      total: 0,
      count: 0,
      max: -Infinity,
      min: Infinity
    };
    acc[expense.category].total += parseFloat(expense.amount); // Convertir a número antes de sumar
    acc[expense.category].count++;
    acc[expense.category].max = Math.max(acc[expense.category].max, parseFloat(expense.amount));
    acc[expense.category].min = Math.min(acc[expense.category].min, parseFloat(expense.amount));
    return acc;
  }, {});

  console.log(chalk.bold('Resumen de gastos:'));
  console.log(`Total: $${total.toFixed(2)}`); 
  console.log(`Número total de transacciones: ${expenses.length}`);

  for (const category in expensesByCategory) {
    const { total, count, max, min } = expensesByCategory[category];
    console.log(`
      ${category}:
        - Total: $${total.toFixed(2)}
        - Transacciones: ${count}
        - Promedio: ${count > 0 ? `$${(total / count).toFixed(2)}` : 'N/A (No hay transacciones)'}
        - Máximo: $${max.toFixed(2)}
        - Mínimo: $${min.toFixed(2)}
    `);
  }
}

// Function to set a budget
function setBudget(amount) {
    try {
      const data = fs.readFileSync('data/budget.json');
      const currentBudget = JSON.parse(data);
      currentBudget.amount = amount;
      fs.writeFileSync('data/budget.json', JSON.stringify(currentBudget, null, 2));
      console.log(chalk.green('Presupuesto establecido exitosamente'));
    } catch (error) {
      // If the budget file doesn't exist, create it with the provided amount
      if (error.code === 'ENOENT') {
        fs.writeFileSync('data/budget.json', JSON.stringify({ amount }, null, 2));
        console.log(chalk.green('Presupuesto establecido exitosamente'));
      } else {
        console.error(chalk.red('Error al establecer el presupuesto'));
      }
    }
  }
  
  // Function to get the current budget
  function getBudget() {
    try {
      const data = fs.readFileSync('data/budget.json');
      const budget = JSON.parse(data);
      return budget.amount;
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.warn(chalk.yellow('No se ha establecido un presupuesto aún.'));
        return 0;
      } else {
        console.error(chalk.red('Error al obtener el presupuesto'));
        return 0;
      }
    }
  }
  
// Función para comparar gastos vs. presupuesto
function compareExpensesToBudget() {
    const expenses = readExpenses();
    const totalExpenses = expenses.reduce((acc, expense) => acc + parseFloat(expense.amount), 0);
    const currentBudget = getBudget();
  
    console.log(chalk.bold('Comparación de gastos vs. presupuesto:'));
    console.log(`Presupuesto actual: $${currentBudget.toFixed(2)}`);
    console.log(`Total de gastos: $${totalExpenses.toFixed(2)}`);
  
    const difference = currentBudget - totalExpenses;
  
    if (difference >= 0) {
      console.log(chalk.green(`¡Estás dentro del presupuesto! Te quedan $${difference.toFixed(2)} para gastar este mes.`));
    } else {
      console.log(chalk.red(`Te has excedido del presupuesto por $${Math.abs(difference).toFixed(2)}. Deberías ajustar tus gastos.`));
    }
  }

// Configurar el comando 'add'
program
  .command('add <description> <amount>')
  .description('Agregar un nuevo gasto')
  .action((description, amount) => {
    addExpense(description, amount);
  });

// Configurar el comando 'list'
program
  .command('list')
  .description('Listar los gastos')
  .action(() => {
    const expenses = readExpenses();
    console.log(chalk.green('Listado de gastos:'));
    console.table(expenses);
  });

// Configurar el comando 'update'
program
  .command('update <id> <description> <amount> <category>')
  .description('Actualizar un gasto')
  .action((id, description, amount, category) => {
    updateExpense(parseInt(id), description, parseFloat(amount), category);
  });

// Configurar el comando 'delete'
program
  .command('delete <id>')
  .description('Eliminar un gasto')
  .action((id) => {
    deleteExpense(parseInt(id));
  });

// Configurar el comando 'summary'
program
  .command('summary')
  .description('Mostrar resumen de gastos')
  .action(summaryExpenses);

// Configurar el comando 'set-budget'
program
  .command('set-budget <amount>')
  .description('Establecer un presupuesto')
  .action((amount) => {
    setBudget(parseFloat(amount));
  });

// Configurar el comando 'get-budget'
program
  .command('get-budget')
  .description('Obtener el presupuesto actual')
  .action(() => {
    const budget = getBudget();
    console.log(chalk.bold('Presupuesto actual:'), chalk.green(`$${budget.toFixed(2)}`));
  });

// Configurar el comando 'compare'
program
  .command('compare')
  .description('Comparar gastos vs. presupuesto')
  .action(compareExpensesToBudget);

// Parsear los argumentos de la línea de comandos
program.parse(process.argv);