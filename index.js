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

// Parsear los argumentos de la línea de comandos
program.parse(process.argv);