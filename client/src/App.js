import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddMenuVariant from './components/AddMenuVariant';
import AddDish from './components/AddDish';
import ChangeDishType from './components/ChangeDishType';
import Card from './components/Card';
import DeleteDish from './components/DeleteDish';

const App = () => {
  const [menuVariants, setMenuVariants] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true); 
  const [AllData, setAllData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const menuResponse = await axios.get('http://localhost:3001/api/menuVariants');
        setMenuVariants(menuResponse.data);

        const dishesResponse = await axios.get('http://localhost:3001/api/dishes');
        setDishes(dishesResponse.data);

        const AllDataResponse = await axios.get('http://localhost:3001/api/menu');
        setAllData(AllDataResponse.data);

        setLoading(false); // Данные загружены
      } catch (error) {
        setErrorMessage('Ошибка загрузки данных');
        setLoading(false); // Завершаем загрузку, даже если ошибка
      }
    };

    fetchData();
  }, []);

  // Таймер для очистки сообщений об ошибках и успехах
  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
        setSuccessMessage('');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  if (loading) {
    return <p>Загрузка...</p>;
  }

  return (
    <div className="app-container">
      <h1>Управление бизнес-ланчами</h1>
      
      <div className="messages">
        {errorMessage && <p className="error">{errorMessage}</p>}
        {successMessage && <p className="success">{successMessage}</p>}
      </div>

      <div className="menu-container">
      <div className="cards">
          {AllData.map((element, index) => (
            <Card
              key={index}
              data={element}
              setErrorMessage={setErrorMessage}
              setSuccessMessage={setSuccessMessage}
              setMenuVariants={setAllData}
              menuVariants={AllData}
              AllDishes={dishes}
            />
          ))}
        </div>
        <AddMenuVariant
          menuVariants={menuVariants}
          setMenuVariants={setMenuVariants}
          setErrorMessage={setErrorMessage}
        />
      </div>

      <div className="dishes-management">
        <AddDish
          dishes={dishes}
          setDishes={setDishes}
          setErrorMessage={setErrorMessage}
          setSuccessMessage={setSuccessMessage}
        />
        <ChangeDishType
          dishes={dishes}
          setDishes={setDishes}
          menuVariants={menuVariants}
          setErrorMessage={setErrorMessage}
          setSuccessMessage={setSuccessMessage}
        />
        <DeleteDish
          dishes={dishes}
          setDishes={setDishes}
          setErrorMessage={setErrorMessage}
          setSuccessMessage={setSuccessMessage}
        />
      </div>
    </div>
  );
};

export default App;
