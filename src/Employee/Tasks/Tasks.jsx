import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { config } from './../../env/env';
import { Container, Paper, Typography, Radio, RadioGroup, FormControlLabel, FormControl, Checkbox, FormGroup, TextField, Button, CircularProgress } from '@mui/material';
import './Tasks.css';

function Tasks() {
  const navigate = useNavigate();
  const [questionsData, setQuestionsData] = useState([]);
  const [answers, setAnswers] = useState({});
  const [testCompleted, setTestCompleted] = useState(false);
  const [marks, setMarks] = useState(null);
  const [loading, setLoading] = useState(false);
  const position = sessionStorage.getItem('hotelPosition');
  const password = sessionStorage.getItem('hotelPassword');

  useEffect(() => {
    setLoading(true);
    fetch(`${config.apiUrl}api/positions/${position}/questions`)
      .then(response => response.json())
      .then(data => {
        // Додаємо оригінальний індекс до кожного питання
        const questionsWithIndex = data.map((question, index) => ({ ...question, originalIndex: index }));
        // Рандомно перемішуємо масив питань
        const shuffledQuestions = shuffleArray(questionsWithIndex);
        setQuestionsData(shuffledQuestions);
      })
      .catch(error => console.error('Error:', error))
      .finally(() => setLoading(false));
  }, [navigate]);
  
  // Функція для перемішування масиву
  function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  const handleAnswerChange = (questionIndex, optionIndex, isChecked) => {
    setAnswers(prevAnswers => {
      const newAnswers = { ...prevAnswers };

      if (questionsData[questionIndex].type === 'checked' || questionsData[questionIndex].type === 'video-checked') {
        if (!newAnswers[questionIndex]) {
          newAnswers[questionIndex] = {};
        }
        newAnswers[questionIndex][optionIndex] = isChecked;
      } else {
        newAnswers[questionIndex] = { [optionIndex]: isChecked };
      }

      return newAnswers;
    });
  };

  const areAllQuestionsAnswered = () => {
    for (const questionIndex in questionsData) {
      if (!answers.hasOwnProperty(questionIndex) || Object.values(answers[questionIndex]).every(option => !option)) {
        return false;
      }
    }
    return true;
  };

  const handleSubmitAnswers = () => {
    if (areAllQuestionsAnswered()) {
      setLoading(true);
      const originalAnswers = {};
  
      // Створюємо об'єкт з відповідями, використовуючи оригінальні індекси питань
      questionsData.forEach((question, index) => {
        const originalIndex = question.originalIndex;
        originalAnswers[originalIndex] = answers[index] || {};
      });
  
      fetch(`${config.apiUrl}api/submitAnswers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password,
          answers: originalAnswers, // Відправляємо відповіді з оригінальними індексами
        }),
      })
        .then(response => response.json())
        .then(data => {
          setTestCompleted(true);
          sessionStorage.setItem('testCompleted', 'true');
  
          fetch(`${config.apiUrl}api/marks`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              password: password,
            }),
          })
            .then(response => response.json())
            .then(data => {
              setMarks(data);
            })
            .catch(error => console.error('Error:', error))
            .finally(() => setLoading(false));
        })
        .catch(error => {
          console.error('Error:', error);
          setLoading(false);
        });
    } else {
      console.log('Будь ласка, відповідь на всі питання перед відправленням.');
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem('testCompleted')) {
      setTestCompleted(true);
      setLoading(true);
      fetch(`${config.apiUrl}api/marks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password,
        }),
      })
        .then(response => response.json())
        .then(data => setMarks(data))
        .catch(error => console.error('Error:', error))
        .finally(() => setLoading(false));
    }
  }, []);

  return (
    <>
      <Typography variant="h3" gutterBottom>
        Тест
      </Typography>    
      {!testCompleted && <Container className={`user-style ${testCompleted ? 'hidden' : ''}`}>
        {!loading && questionsData.error !== 'Position not found' ? (
          questionsData.map((q, questionIndex) => (
            <Paper key={questionIndex} elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
              <Typography variant="h6" className='user-task-title'>{q.question}</Typography>
              {q.image && (
                <img className='added-image' src={`${config.apiUrl}${q.image}`}/>
              )}
              {q.link && q.link != 'null' && (
                <div className='video-iframe'>
                  <iframe
                    src={q.link}
                    title={`Video for question ${questionIndex}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
              <FormControl component="fieldset">
                {q.type === 'checked' || q.type === 'video-checked' ? (
                  <FormGroup
                    aria-label={`question_${questionIndex}`}
                    name={`question_${questionIndex}`}
                  >
                    {q.options.map((option, optionIndex) => (
                      <FormControlLabel
                        key={optionIndex}
                        value={option}
                        control={<Checkbox />}
                        label={option}
                        onChange={(event) => handleAnswerChange(questionIndex, optionIndex, event.target.checked)}
                      />
                    ))}
                  </FormGroup>
                ) : (
                  <RadioGroup
                    aria-label={`question_${questionIndex}`}
                    name={`question_${questionIndex}`}
                  >
                    {q.options.map((option, optionIndex) => (
                      <FormControlLabel
                        key={optionIndex}
                        value={option}
                        control={<Radio />}
                        label={option}
                        onChange={(event) => handleAnswerChange(questionIndex, optionIndex, event.target.checked)}
                      />
                    ))}
                  </RadioGroup>
                )}
              </FormControl>
            </Paper>
          ))
        ) : (
          <CircularProgress />
        )}
        {!loading && (
          <div className='send-button'>
            <Button 
              variant="contained" 
              style={{ backgroundColor: '#47B972', margin: '0 auto'}} 
              onClick={handleSubmitAnswers}
              disabled={!areAllQuestionsAnswered()}
            >
              Відправити
            </Button>
          </div>
        )}
      </Container>
    }
      {testCompleted && (
        <>
          {marks !== null ? (
            <>
              <Typography variant="h5" gutterBottom>
                Кількість правильних відповідей: {marks}
              </Typography>
              {
                +(+marks.split('/')[0] / +marks.split('/')[1]) >= 0.8 ? (
                  <p style={{color: '#47B972'}}>Тест пройдено</p>
                ) : (
                  <p style={{color: 'red'}}>Тест не пройдено</p>
                )
              }
            </>
          ) : (
            <CircularProgress />
          )}
        </>
      )}
    </>
  )
}

export default Tasks;
