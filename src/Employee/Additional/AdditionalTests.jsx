import React, { useState, useEffect } from 'react';
import {
  Paper,
  FormControl,
  RadioGroup,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Radio,
  Typography,
  Box,
  Tab,
  CircularProgress,
  Tabs,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { styled } from '@mui/system';
import { config } from './../../env/env';
import IframeViewer from '../../Employee/Info/IframeViewer';

const MyTabs = styled(Tabs)({
  '& .MuiTabs-indicator': {
    backgroundColor: '#47B972',
  },
  '& .MuiTab-root': {
    color: 'rgba(0, 0, 0, 0.6)',
    '&.Mui-selected': {
      color: '#47B972',
    },
  },
});

function AdditionalTests() {
  const [positions, setPositions] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [showContent, setShowContent] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [questionsData, setQuestionsData] = useState([]);
  const [answers, setAnswers] = useState({});
  const [testCompleted, setTestCompleted] = useState(false);
  const [marks, setMarks] = useState(null);
  const [dialogLoad, setDialogLoad] = useState(false);

  useEffect(() => {
    if (selectedPosition) {
      setLoading(true);
      fetch(`${config.apiUrl}api/positions/${encodeURIComponent(selectedPosition)}/questions`)
        .then(response => response.json())
        .then(data => {
          const questionsWithIndex = data.map((question, index) => ({ ...question, originalIndex: index }));
          const shuffledQuestions = shuffleArray(questionsWithIndex);
          setQuestionsData(shuffledQuestions);
        })
        .catch(error => console.error('Error:', error))
        .finally(() => setLoading(false));
    }
  }, [selectedPosition]);

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

  function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setQuestionsData(shuffleArray(questionsData));
    setShowContent(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setAnswers({});
  };

  const handleChange = (event, newValue) => {
    setCurrentTab(newValue);
    setSelectedPosition(positions[newValue]);
    setShowContent(false);
    setTestCompleted(false);
  };

  const handleShowContent = () => {
    setShowContent(!showContent);
  };

  const handleSubmitAnswers = async () => {
    setDialogLoad(true);
    setTestCompleted(true);
    try {
      const password = sessionStorage.getItem('hotelPassword');
      const originalAnswers = {};

      questionsData.forEach((question, index) => {
        const originalIndex = question.originalIndex;
        originalAnswers[originalIndex] = answers[index] || {};
      });
  
      const response = await fetch(`${config.apiUrl}api/submitNewAnswersEndpoint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password,
          answers: originalAnswers,
          selectedPosition: selectedPosition,
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        setMarks(data.marks);
        sessionStorage.setItem(`testMarks${selectedPosition}`, data.marks);
      } else {
        throw new Error('Помилка при відправленні даних на сервер');
      }
    } catch (error) {
      console.error('Помилка під час відправлення даних на сервер:', error);
    }
    setDialogLoad(false);
  };

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await fetch(`${config.apiUrl}api/positions/accessible`);
        if (response.ok) {
          const positionsData = await response.json();
          setPositions(positionsData);
          setSelectedPosition(positionsData[0]);
        } else {
          console.error('Помилка при отриманні позицій:', response.statusText);
        }
      } catch (error) {
        console.error('Помилка при отриманні позицій:', error);
      }
      setLoading(false);
    };

    fetchPositions();
  }, []);



  return (
    <div style={{ width: '100%', overflow: 'hidden', wordWrap: 'break-word' }}>
      <Typography variant="h3" gutterBottom>Оберіть тест</Typography>

      {loading ? ( 
        <CircularProgress />
      ) : (
        <>
          <Box sx={{ maxWidth: '100%', backgroundColor: '#FFF', borderRadius: '5px' }}>
            <MyTabs value={currentTab} onChange={handleChange} variant="scrollable" scrollButtons allowScrollButtonsMobile>
              {positions.map((position, index) => (
                <Tab 
                  key={index} 
                  label={position} 
                />
              ))}
            </MyTabs>
          </Box>
          <div>
            <Button 
              onClick={handleShowContent}
              variant="contained"
              style={{ backgroundColor: '#47B972', margin: '20px auto 20px', maxWidth: '300px', marginRight: '10px'}}
            >
              {showContent ? 'Скрити файл' : 'Показати файл'}
            </Button>
            <Button 
              onClick={handleOpenDialog}
              variant="contained"
              style={{ backgroundColor: '#47B972', margin: '20px auto 20px', maxWidth: '300px'}}
            >
              Відкрити тест
            </Button>
            {showContent && selectedPosition && <IframeViewer positionName={selectedPosition} />}
          </div>
          <Dialog 
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Тест</DialogTitle>
            <DialogContent>
            {dialogLoad ? (
              <CircularProgress />
            ) : (
              <>
                {!sessionStorage.getItem(`testMarks${selectedPosition}`) && 
                  questionsData.map((question, questionIndex) => (
                    <Paper key={questionIndex} elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
                      <Typography variant="h6" className='user-task-title'>{question.question}</Typography>
                      {question.image && (
                        <img className='added-image' src={`${config.apiUrl}${question.image}`} alt={`Question ${questionIndex}`} />
                      )}
                      {question.link && question.link !== 'null' && (
                        <div className='video-iframe'>
                          <iframe
                            src={question.link}
                            title={`Video for question ${questionIndex}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      )}
                      <FormControl component="fieldset">
                        {question.type === 'checked' || question.type === 'video-checked' ? (
                          <FormGroup aria-label={`question_${questionIndex}`} name={`question_${questionIndex}`}>
                            {question.options.map((option, optionIndex) => (
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
                          <RadioGroup aria-label={`question_${questionIndex}`} name={`question_${questionIndex}`}>
                            {question.options.map((option, optionIndex) => (
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
                }
              </>
            )}
              
              <div className='send-button'>
                {sessionStorage.getItem(`testMarks${selectedPosition}`) ? (
                  <>
                    <Typography variant="h5" gutterBottom>
                      Кількість правильних відповідей: {sessionStorage.getItem(`testMarks${selectedPosition}`)}
                    </Typography>
                    {
                      +(+sessionStorage.getItem(`testMarks${selectedPosition}`).split('/')[0] / +sessionStorage.getItem(`testMarks${selectedPosition}`).split('/')[1]) >= 0.8 ? (
                        <p style={{color: '#47B972'}}>Тест пройдено</p>
                      ) : (
                        <p style={{color: 'red'}}>Тест не пройдено</p>
                      )
                    }
                  </>
                ) : (
                  <>
                    {testCompleted ? (
                      <>
                        {marks !== null && (
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
                        )}
                      </>
                    ) : (
                      <Button 
                        variant="contained" 
                        style={{ backgroundColor: '#47B972', margin: '0 auto'}} 
                        disabled={!areAllQuestionsAnswered()}
                        onClick={handleSubmitAnswers}
                      >
                        Відправити
                      </Button>
                    )}
                  </>
                )}
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Закрити
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </div>
  );
}

export default AdditionalTests;
