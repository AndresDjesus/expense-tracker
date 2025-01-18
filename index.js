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

// Parsear los argumentos de la línea de comandos
program.parse(process.argv);