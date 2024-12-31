const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Настройки подключения к базе данных
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'rootroot', // Укажите свой пароль MySQL
  database: 'restaurant',
  port: 3307,
});


// Проверка подключения к базе данных
db.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err);
  } else {
    console.log('Подключение к базе данных установлено');
  }
});


// Получить все варианты меню
app.get('/api/menuVariants', (req, res) => {
  db.query('SELECT * FROM menu_variants', (err, results) => {
    if (err) {
      res.status(500).send('Ошибка получения вариантов меню');
    } else {
      res.json(results);
    }
  });
});

// Добавить новый вариант меню
app.post('/api/menuVariants', (req, res) => {
  const { day_of_week, variant_number } = req.body;

  if (!day_of_week || !variant_number) {
    return res.status(400).send('Пожалуйста, укажите день недели и номер варианта');
  }

  // Проверяем, существует ли уже вариант меню с таким днем недели и номером варианта
  db.query(
    'SELECT * FROM menu_variants WHERE day_of_week = ? AND variant_number = ?',
    [day_of_week, variant_number],
    (err, results) => {
      if (err) {
        console.error('Ошибка при проверке варианта меню:', err);
        return res.status(500).send('Ошибка при проверке варианта меню');
      }

      if (results.length > 0) {
        return res.status(400).send('Вариант меню с таким днем недели и номером уже существует');
      }

      // Если не существует, добавляем вариант меню
      db.query(
        'INSERT INTO menu_variants (day_of_week, variant_number) VALUES (?, ?)',
        [day_of_week, variant_number],
        (err, results) => {
          if (err) {
            console.error('Ошибка при добавлении варианта меню:', err);
            return res.status(500).send('Ошибка при добавлении варианта меню');
          }

          res.json({
            id: results.insertId,
            day_of_week: day_of_week,
            variant_number: variant_number,
          });
        }
      );
    }
  );
});

// Удалить вариант меню и связанные записи из menu_variant_dishes
app.delete('/api/menuVariants/:id', (req, res) => {
  const { id } = req.params;

  // Начинаем с удаления записей из menu_variant_dishes
  db.query('DELETE FROM menu_variant_dishes WHERE menu_variant_id = ?', [id], (err) => {
    if (err) {
      return res.status(500).send('Ошибка при удалении связанных блюд из варианта меню');
    }

    // Затем удаляем сам вариант меню
    db.query('DELETE FROM menu_variants WHERE id = ?', [id], (err) => {
      if (err) {
        res.status(500).send('Ошибка при удалении варианта меню');
      } else {
        res.send('Вариант меню и связанные блюда успешно удалены');
      }
    });
  });
});

// Endpoint для добавления нового блюда
app.post('/api/dishes', (req, res) => {
  const { name, dish_type } = req.body;

  if (!name || !dish_type) {
    return res.status(400).send('Название и тип блюда обязательны');
  }

  const query = 'INSERT INTO dishes (name, dish_type) VALUES (?, ?)';
  db.query(query, [name, dish_type], (err, results) => {
    if (err) {
      console.error('Ошибка при добавлении блюда:', err);
      return res.status(500).send('Ошибка при добавлении блюда');
    }

    // Возвращаем добавленное блюдо
    const newDish = {
      id: results.insertId,
      name,
      dish_type
    };
    res.status(201).json(newDish);
  });
});


app.get('/api/dishes', (req, res) => {
  db.query('SELECT * FROM dishes', (err, results) => {
    if (err) {
      res.status(500).send('Ошибка получения блюд');
    } else {
      res.json(results);
    }
  });
});

// Смена типа блюда
app.put('/api/dishes/:id', (req, res) => {
  const { id } = req.params;
  const { dish_type } = req.body;

  // Проверка, что передан новый тип блюда
  if (!dish_type) {
    return res.status(400).json({ error: 'Пожалуйста, укажите новый тип блюда' });
  }

  // Шаг 1: Получаем информацию о текущем блюде по id
  db.query('SELECT * FROM dishes WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при проверке существования блюда' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Блюдо не найдено' });
    }

    const currentDishType = results[0].dish_type;

    if (currentDishType !== dish_type) {
      // Находим все блюда в меню, куда входит это блюдо, и проверяем типы
      const query = `
        SELECT mvd.dish_id
        FROM menu_variant_dishes mvd
        JOIN dishes d ON mvd.dish_id = d.id
        WHERE mvd.menu_variant_id IN (
          SELECT menu_variant_id FROM menu_variant_dishes WHERE dish_id = ?
        ) AND d.dish_type = ?`;

      db.query(query, [id, dish_type], (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Ошибка при проверке конфликта типов в меню' });
        }

        if (results.length > 0) {
          return res.status(400).json({ error: `Конфликт! В меню уже есть блюда типа ${dish_type}` });
        }

        // Шаг 3: Если конфликта нет, обновляем тип блюда
        const updateQuery = 'UPDATE dishes SET dish_type = ? WHERE id = ?';
        db.query(updateQuery, [dish_type, id], (err, updateResults) => {
          if (err) {
            return res.status(500).json({ error: 'Ошибка при обновлении типа блюда' });
          }

          // Отправляем успешный ответ
          res.status(200).json({
            id,
            dish_type
          });
        });
      });
    } else {
      // Если тип блюда не изменился, просто отправляем успешный ответ
      res.status(200).json({
        id,
        dish_type
      });
    }
  });
});


// Получить блюда для выбранного варианта меню
app.get('/api/menuVariants/:id/dishes', (req, res) => {
  const menuVariantId = req.params.id;

  db.query(
    'SELECT dishes.id, dishes.name, dishes.dish_type FROM dishes ' +
    'JOIN menu_variant_dishes ON dishes.id = menu_variant_dishes.dish_id ' +
    'WHERE menu_variant_dishes.menu_variant_id = ?',
    [menuVariantId],
    (err, results) => {
      if (err) {
        console.error('Ошибка при получении блюд для варианта меню:', err);
        return res.status(500).send('Ошибка при получении блюд');
      }

      res.json(results);
    }
  );
});

app.get('/api/menuVariants', (req, res) => {
  db.query(
    'SELECT id, day_of_week FROM menu_variants', 
    (err, results) => {
      if (err) {
        console.error('Ошибка при получении вариантов меню:', err);
        return res.status(500).send('Ошибка при получении вариантов меню');
      }
      res.json(results);
    }
  );
});

app.post('/api/dishes', (req, res) => {
  const { name, dish_type } = req.body;

  // Проверяем, что оба значения присутствуют
  if (!name || !dish_type) {
    return res.status(400).json({ error: 'Название и тип блюда обязательны' });
  }

  // Шаг 1: Проверяем, существует ли уже блюдо с таким же названием и типом
  const checkQuery = 'SELECT * FROM dishes WHERE name = ? AND dish_type = ?';
  db.query(checkQuery, [name, dish_type], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при проверке на дублирование' });
    }

    // Если блюдо с таким названием и типом уже существует, возвращаем ошибку
    if (results.length > 0) {
      return res.status(400).json({ error: 'Блюдо с таким названием и типом уже существует' });
    }

    // Шаг 2: Если дублирования нет, добавляем блюдо в базу данных
    const insertQuery = 'INSERT INTO dishes (name, dish_type) VALUES (?, ?)';
    db.query(insertQuery, [name, dish_type], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка при добавлении блюда' });
      }

      // Возвращаем добавленное блюдо
      const newDish = {
        id: results.insertId,
        name,
        dish_type
      };
      res.status(201).json({
        success: true,
        message: 'Блюдо успешно добавлено',
        dish: newDish,
      });
    });
  });
});

// Удалить блюдо из варианта меню
app.delete('/api/menuVariantDishes/:menuVariantId/:dishId', (req, res) => {
  const { menuVariantId, dishId } = req.params;

  db.query(
    'DELETE FROM menu_variant_dishes WHERE menu_variant_id = ? AND dish_id = ?',
    [menuVariantId, dishId],
    (err) => {
      if (err) {
        return res.status(500).send('Ошибка при удалении блюда из варианта меню');
      }
      res.send('Блюдо удалено из варианта меню');
    }
  );
});

app.get('/api/menu', (req, res) => {
  const query = `
    SELECT 
      mv.id AS menu_variant_id,
      mv.day_of_week,
      mv.variant_number,
      d.id AS dish_id,
      d.name AS dish_name,
      d.dish_type
    FROM 
      menu_variants mv
    LEFT JOIN 
      menu_variant_dishes mvd ON mv.id = mvd.menu_variant_id
    LEFT JOIN 
      dishes d ON mvd.dish_id = d.id
    ORDER BY 
      mv.id, d.dish_type;
  `;

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send('Ошибка получения меню');
    } else {
      // Группируем блюда по меню
      const menuVariants = [];
      results.forEach(row => {
        const existingMenu = menuVariants.find(menu => menu.menu_variant_id === row.menu_variant_id);
        
        if (!existingMenu) {
          menuVariants.push({
            menu_variant_id: row.menu_variant_id,
            day_of_week: row.day_of_week,
            variant_number: row.variant_number,
            dishes: [
              {
                dish_id: row.dish_id,
                dish_name: row.dish_name,
                dish_type: row.dish_type
              }
            ]
          });
        } else {
          existingMenu.dishes.push({
            dish_id: row.dish_id,
            dish_name: row.dish_name,
            dish_type: row.dish_type
          });
        }
      });

      res.json(menuVariants);
    }
  });
});

app.post('/api/addmenuVariantDishes/:menu_variant_id', (req, res) => {
  const menu_variant_id = parseInt(req.params.menu_variant_id);
  const { Tag } = req.body; 

  if (!Tag) {
    return res.status(400).json({ error: 'Необходимо выбрать блюдо' });
  }

  db.query('SELECT * FROM dishes WHERE id = ?', [Tag], (err, results) => {
    if (err) {
      return res.status(500).send('Ошибка при запросе блюда');
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Блюдо не найдено' });
    }

    const dish = results[0];

    // Проверяем, что блюдо не добавлено в данный вариант меню
    db.query('SELECT * FROM menu_variant_dishes WHERE menu_variant_id = ? AND dish_id = ?', 
      [menu_variant_id, dish.id], (err, results) => {
        if (err) {
          return res.status(500).send('Ошибка при проверке существующих блюд в меню');
        }

        if (results.length > 0) {
          return res.status(400).json({ error: 'Это блюдо уже добавлено в меню' });
        }

        // Если все проверки прошли успешно, добавляем блюдо в меню
        db.query('INSERT INTO menu_variant_dishes (menu_variant_id, dish_id) VALUES (?, ?)', 
          [menu_variant_id, dish.id], (err, results) => {
            if (err) {
              return res.status(500).send('Ошибка при добавлении блюда в меню');
            }

            res.status(201).json({ success: 'Блюдо успешно добавлено в меню' });
          }
        );
    });
  });
});

app.post('/api/moveDish/:dishId', (req, res) => {
  const { prevVariantId, selectedMenuVariantId } = req.body;
  const dishId = parseInt(req.params.dishId); 

  if (selectedMenuVariantId == null) {
    return res.status(500).json({ error: 'Ошибка при выборе меню' });
  }

  db.query('DELETE FROM menu_variant_dishes WHERE menu_variant_id = ? AND dish_id = ?', [parseInt(prevVariantId), dishId], (err) => {
    if (err) {
        return res.status(500).json({ error: 'Ошибка при удалении записи' });
    }

    db.query('INSERT INTO menu_variant_dishes VALUES (?, ?)', [parseInt(selectedMenuVariantId), dishId], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при добавлении записи' });
        }
        return res.status(200).json({ success: 'Блюдо успешно перемещено' });
        });
  });
});

app.delete('/api/deleteDish/:dishId', (req, res) => {
  const dishId = req.params.dishId;

  const deleteFromMenuVariantDishes = `DELETE FROM menu_variant_dishes WHERE dish_id = ?`;
  db.query(deleteFromMenuVariantDishes, [dishId], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Ошибка при удалении из menu_variant_dishes');
      return;
    }

    // После этого удаляем из dishes
    const deleteFromDishes = `DELETE FROM dishes WHERE id = ?`;
    db.query(deleteFromDishes, [dishId], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Ошибка при удалении из dishes');
        return;
      }

      res.send('Блюдо успешно удалено');
    });
  });
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер работает на http://localhost:${port}`);
});
