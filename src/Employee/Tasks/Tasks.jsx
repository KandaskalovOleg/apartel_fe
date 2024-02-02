import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { config } from './../../env/env';
import { Container, Paper, Typography, Radio, RadioGroup, FormControlLabel, FormControl, TextField, Button } from '@mui/material';
import './Tasks.css';

function Tasks() {
  const navigate = useNavigate();
  const [questionsData, setQuestionsData] = useState([]);
  const position = sessionStorage.getItem('hotelPosition');

  useEffect(() => {
    if (!position) {
      navigate('/');
    } else {

      fetch(`${config.apiUrl}api/positions/${position}/questions`)
        .then(response => response.json())
        .then(data => setQuestionsData(data))
        .catch(error => console.error('Error:', error));
    }
  }, [navigate, position]);

  console.log(questionsData);

  return (
    <>
      <Typography variant="h3" gutterBottom>
        Тест
      </Typography>    
      <Container className='user-style'>
        {questionsData.map((q, questionIndex) => (
          <Paper key={questionIndex} elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
            <Typography variant="h6" className='user-task-title'>{q.question}</Typography>
            {q.link && (
              <div>
                <iframe
                  src={q.link}
                  title={`Video for question ${questionIndex}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
            <FormControl component="fieldset">
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
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Paper>
        ))}
        <div className='send-button'>
          <Button variant="contained" style={{ backgroundColor: '#47B972', margin: '0 auto'}}>
            Відправити
          </Button>
        </div>
      </Container>
    </>
  )
}

export default Tasks;
