/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { 
  Typography, 
  Tabs, 
  Tab, 
  Box, 
  TextField, 
  Button, 
  Autocomplete, 
  Accordion, 
  AccordionSummary, 
  ListItem, 
  List, 
  ListItemText,
  ListItemIcon,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox 
} from '@mui/material';
import { config } from './../../env/env';
import { styled } from '@mui/system';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import './Positions.css';

const StyledTextField = styled(TextField)({
  '& label.Mui-focused': {
    color: '#47B972',
  },
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': {
      borderColor: '#47B972',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#47B972',
    },
  },
});

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

function TabPanel({ children, value, index, positionsData, setPositionsData, ...other }) {
  const [newQuestion, setNewQuestion] = useState('');
  const [questionType, setQuestionType] = useState('radio');
  const [videoLink, setVideoLink] = useState('');
  const [image, setImage] = useState(null);
  const [options, setOptions] = useState(['', '']);
  const [correctOptions, setCorrectOptions] = useState([]);
  const [hasDuplicateOptions, setHasDuplicateOptions] = useState(false);
  const [selectedImgName, setSelectedImgName] = useState('');

  const handleImageChange = (event) => {
    const file = event.target.files;
    setSelectedImgName(file[0] ? file.name : '');
    setImage(file[0]);
  }

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    setOptions(updatedOptions);
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  
    setHasDuplicateOptions(hasDuplicates(updatedOptions));
  };

  const hasDuplicates = (array) => new Set(array).size !== array.length;

  const handleTypeChange = (newType) => {
    // Очищення варіантів відповіді та питання при зміні типу
    setOptions(['', '']);
    setCorrectOptions([]);
    setImage('');
    setNewQuestion('');
    setQuestionType(newType);
    setVideoLink('');
  };

  const handleCheckboxChange = (index) => {
    const updatedCorrectOptions = (questionType === 'radio' || questionType === 'video-radio')
      ? [index]
      : correctOptions.includes(index)
        ? correctOptions.filter((i) => i !== index)
        : [...correctOptions, index];
    setCorrectOptions(updatedCorrectOptions);
  };

  const handleAddQuestion = async () => {
    const positionId = positionsData[value].id;
  
    // Перевірка обов'язкових полів
    if (!newQuestion || options.length < 2 || options.some(option => !option.trim())) {
      console.error('Будь ласка, заповніть всі обов\'язкові поля.');
      return;
    }
  
    // Перевірка обов'язковості videoLink для обраних типів питань
    if (['video-radio', 'video-checked'].includes(questionType) && !videoLink) {
      console.error('Будь ласка, введіть посилання на відео.');
      return;
    }
  
    // Перевірка обов'язковості вибору правильної відповіді
    if (correctOptions.length === 0) {
      console.error('Будь ласка, виберіть хоча б один правильний варіант відповіді.');
      return;
    }
  
    const uniqueOptions = Array.from(new Set(options));
    if (options.length !== uniqueOptions.length) {
      console.error('Будь ласка, виберіть унікальні варіанти відповіді.');
      return;
    }

    const formData = new FormData();
    formData.append('question', newQuestion);
    formData.append('type', questionType);
    formData.append('link', questionType.includes('video') ? videoLink : null);
    
    // Створюємо об'єкт для options відповідного формату
    const optionsObject = {};
    uniqueOptions.forEach((option, index) => {
        optionsObject[option] = correctOptions.includes(index);
    });
    
    // Додаємо об'єкт options у FormData
    formData.append('options', JSON.stringify(optionsObject));
    if (image) {
        formData.append('image', image);
    }

    try {
        const response = await fetch(`${config.apiUrl}api/questions/${positionId}`, {
            method: 'POST',
            body: formData,
        });
        setSelectedImgName('');
        if (response.ok) {
            const addedQuestion = await response.json();
            const updatedPositions = [...positionsData];
            updatedPositions[value].pool.push(addedQuestion);
            setPositionsData(updatedPositions);
            setNewQuestion('');
            setQuestionType('radio');
            setVideoLink('');
            setImage('');
            setOptions(['', '']);
            setCorrectOptions([]);
        } else {
            console.error('Помилка при додаванні питання:', response.statusText);
        }
    } catch (error) {
        console.error('Помилка при відправці запиту на сервер:', error);
    }
};


  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          {children}
          <form className='form-add'>
            <Typography variant="h3" gutterBottom>
              Додати питання
            </Typography>
            <StyledTextField
              label="Нове питання"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />
            <input type="file" accept="image/*" onChange={handleImageChange} value={selectedImgName} style={{ color: 'black' }}/>
            <FormControl component="fieldset" style={{textAlign: 'left'}}>
              <FormLabel component="legend">Тип питання</FormLabel>
              <RadioGroup
                row
                aria-label="Тип питання"
                name="questionType"
                value={questionType}
                onChange={(e) => handleTypeChange(e.target.value)}
              >
                {['radio', 'checked', 'video-radio', 'video-checked'].map((type) => (
                  <FormControlLabel key={type} value={type} control={<Radio />} label={type.replace('-', ' ')} />
                ))}
              </RadioGroup>
            </FormControl>
            {questionType.includes('video') && (
              <StyledTextField
                label="Посилання на відео"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
              />
            )}
            {options.map((option, optionIndex) => (
              <div key={optionIndex} style={{display: 'flex'}}>
                <StyledTextField
                  label={`Варіант ${optionIndex + 1}`}
                  value={option}
                  style={{width: '100%'}}
                  onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                />
                <Checkbox
                  checked={correctOptions.includes(optionIndex)}
                  onChange={() => handleCheckboxChange(optionIndex)}
                />
                <IconButton onClick={() => handleRemoveOption(optionIndex)}>
                  <CloseIcon />
                </IconButton>
              </div>
            ))}
            <IconButton onClick={handleAddOption} style={{width: '40px', margin: '0 auto'}}>
              <AddIcon />
            </IconButton>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleAddQuestion}
              style={{ backgroundColor: '#47B972', margin: '0 auto 20px', width: '250px'}}
              disabled={
                !newQuestion || 
                options.length < 2 || 
                options.some(option => !option.trim()) || 
                (['video-radio', 'video-checked'].includes(questionType) && !videoLink) || 
                correctOptions.length === 0 ||
                hasDuplicateOptions 
              }            
            >
              Додати питання
            </Button>
          </form>
        </Box>
      )}
    </div>
  );
}

function Positions() {
  const [value, setValue] = useState(0);
  const [positionsData, setPositionsData] = useState([]);
  const [newPositionName, setNewPositionName] = useState('');
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [updated, setUpdated] = useState('false');
  const [isPositionPublic, setIsPositionPublic] = useState(false);

  const handleAddPosition = async () => {
    try {
      const response = await fetch(`${config.apiUrl}api/positions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: newPositionName,
          access: isPositionPublic
        }),
      });

      if (response.ok) {
        const newPosition = await response.json();
        setPositionsData(prevPositions => [...prevPositions, newPosition]);
        setNewPositionName('');
        setIsPositionPublic(false);
      } else {
        console.error('Помилка при додаванні нової позиції:', response.statusText);
      }
    } catch (error) {
      console.error('Помилка при додаванні нової позиції:', error);
    }
  };

  const handleDeleteQuestion = async (positionId, questionIdToDelete) => {
    try {
      const response = await fetch(`${config.apiUrl}api/questions/${positionId}/${questionIdToDelete}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        const updatedPositions = [...positionsData];
        const positionIndex = updatedPositions.findIndex(pos => pos.id === positionId);
        if (positionIndex !== -1) {
          updatedPositions[positionIndex].pool = updatedPositions[positionIndex].pool.filter(q => q.id !== questionIdToDelete);
          setPositionsData(updatedPositions);
        }
        setUpdated(true);
      } else {
        console.error('Помилка при видаленні питання:', response.statusText);
      }
    } catch (error) {
      console.error('Помилка при видаленні питання:', error);
    }
  };

  const handleDeleteSelectedPosition = async () => {
    if (selectedPosition) {
      try {
        const response = await fetch(`${config.apiUrl}api/positions/${selectedPosition.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          const deletedPosition = await response.json();
          setPositionsData(prevPositions => prevPositions.filter(position => position.id !== deletedPosition.id));
          setSelectedPosition(null);
        } else {
          console.error('Помилка при видаленні позиції:', response.statusText);
        }
      } catch (error) {
        console.error('Помилка при видаленні позиції:', error);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${config.apiUrl}api/positions`);
        if (response.ok) {
          const data = await response.json();
          setPositionsData(data);
        } else {
          console.error('Помилка при отриманні даних з серверу:', response.status);
        }
      } catch (error) {
        console.error('Помилка при отриманні даних з серверу:', error);
      }
    };
    if (updated) {
      setUpdated(false);
      fetchData();
    }
  }, [updated]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div style={{width: '100%'}}>
      <Typography variant="h3" gutterBottom>
        Посади та питання
      </Typography>

      <div className='add-delete'>
        <div className='add-position'>
          <StyledTextField
            label="Назва посади"
            value={newPositionName}
            onChange={(e) => setNewPositionName(e.target.value)}
          />
          <label>
            Загальнодоступна посада:
            <input
              type="checkbox"
              checked={isPositionPublic}
              onChange={(e) => setIsPositionPublic(e.target.checked)}
            />
          </label>
          <Button 
            onClick={handleAddPosition} 
            variant="contained" 
            style={{ backgroundColor: '#47B972', margin: '0 auto 20px', width: '250px'}}
            disabled={!newPositionName}
          >
            Додати посаду
          </Button>
        </div>

        <div className='delete-position'>
          <Autocomplete
            options={positionsData}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <StyledTextField
                {...params}
                label="Назва посади"
                variant="outlined"
              />
            )}
            value={selectedPosition}
            onChange={(event, newValue) => setSelectedPosition(newValue)}
          />

          <Button
            onClick={handleDeleteSelectedPosition}
            variant="contained"
            style={{ backgroundColor: '#FF4B4B', margin: '0 auto 20px', width: '250px'}}
            disabled={!selectedPosition}
          >
            Видалити позицію
          </Button>
        </div>
      </div>
      
      <Box sx={{ maxWidth: '100%', backgroundColor: '#FFF', borderRadius: '5px' }}>
        <MyTabs value={value} onChange={handleChange} variant="scrollable" scrollButtons allowScrollButtonsMobile>
          {positionsData.map((position, index) => (
            <Tab 
              key={index} 
              label={position.name}
              sx={{
                backgroundColor: position.access ? 'rgba(224, 224, 224, 1)' : '#fff',
              }}
            />
          ))}
        </MyTabs>
      </Box>
      {positionsData.map((position, index) => (
        <TabPanel 
          key={index}
          value={value}
          index={index}
          positionsData={positionsData}
          setPositionsData={setPositionsData}
        >
          {position.pool.map((question, questionIndex) => (
            <Accordion key={questionIndex} style={{ padding: '20px', marginBottom: '20px' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" className='title-question'>
                  {question.question}
                </Typography>
              </AccordionSummary>
              {question.image && (
                <img className='added-image' src={`${config.apiUrl}${question.image}`}/>
              )}
              {question.link && question.link != 'null' && (
                <div style={{ textAlign: 'left'}} className='video-iframe'>
                  <iframe
                    src={question.link}
                    title={`Video for question ${questionIndex}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
              <List>
                {Object.entries(question.options).map(([optionText, optionValue], optionIndex) => (
                  <ListItem key={optionIndex}>
                    <ListItemIcon>
                      <FiberManualRecordIcon style={{ color: optionValue ? 'green' : 'red' }} />
                    </ListItemIcon>
                    <ListItemText primary={optionText} />
                  </ListItem>
                ))}
              </List>
              <IconButton 
                edge="end" 
                aria-label="delete" 
                onClick={() => handleDeleteQuestion(position.id, questionIndex)}
                style={{ marginLeft: '8px', display: 'block' }}
              >
                <DeleteIcon />
              </IconButton>
            </Accordion>
          ))}
        </TabPanel>
      ))}
    </div>
  );
}

export default Positions;
