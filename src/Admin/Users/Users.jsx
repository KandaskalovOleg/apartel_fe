import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Typography,
  IconButton,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  TextField,
  Autocomplete,
  Box, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  ListItemIcon, 
  List, 
  ListItem, 
  ListItemText,
  Tab,
  Tabs 
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import DeleteIcon from '@mui/icons-material/Delete';
import { config } from './../../env/env';
import { styled } from '@mui/system';
import './Users.css';
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

const StyledTableRow = styled(TableRow)({
  '&:nth-of-type(odd)': {
    backgroundColor: '#eee',
  },
});

function Users() {
  const [positions, setPositions] = useState([]);
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [users, setUsers] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [newUserData, setNewUserData] = useState({ name: '', surname: '', position: '' });
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openAllTestsDialog, setOpenAllTestsDialog] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [fileLoading, setFileLoading] = useState(false);

  const [docFiles, setDocFiles] = useState(Array(positions.length).fill(null));
  const [selectedFileName, setSelectedFileName] = useState('');

  const [showContent, setShowContent] = useState(false);
  const [selectedPositionIndex, setSelectedPositionIndex] = useState(0);

  const handleShowContent = () => {
    setShowContent((prevShowContent) => !prevShowContent);
  };
  
  const handleFileChange = (index, event) => {
    const files = event.target.files;
    setSelectedFileName(files[0] ? files.name : '');
    const newDocFiles = [...docFiles];
    newDocFiles[index] = files[0];
    setDocFiles(newDocFiles);
  };

  const handleSaveContent = async (index) => {
    try {
      setFileLoading(true); 
      const docFile = docFiles[index];
      const positionId = positions[index].id;

      const formData = new FormData();
      formData.append('doc', docFile);

      const response = await fetch(`${config.apiUrl}api/positions/${positionId}/info`, {
        method: 'POST',
        body: formData,
      });

      setSelectedFileName('');
      
      setShowContent(false);
    } catch (error) {
      console.error('Помилка при збереженні вмісту:', error);
    } finally {
      setFileLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${config.apiUrl}api/users`);
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Помилка при отриманні користувачів:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPositions = async () => {
      try {
        const response = await fetch(`${config.apiUrl}api/positions`);
        const data = await response.json();
        setPositions(data);

        const editorHtmlsFromServer = data.map((position) => position.info || ''); 
      } catch (error) {
        console.error('Помилка при отриманні посад:', error);
      } finally {
        setLoadingPositions(false);
      }
    };

    fetchData();
    fetchPositions();
  }, []);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDetailsDialog = (user) => {
    setSelectedUser(user);
    setOpenDetailsDialog(true);
  };
  
  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
  };

  const handleOpenAllTestsDialog = (user) => {
    setSelectedUser(user);
    setOpenAllTestsDialog(true);
  };
  
  const handleCloseAllTestsDialog = (user) => {
    setOpenAllTestsDialog(false);
  };

  const handleSortRequest = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleDeleteUser = async (userId) => {
    try {
      setLoading(true);
  
      await fetch(`${config.apiUrl}api/users/${userId}`, {
        method: 'DELETE',
      });
  
      const updatedUsers = users.filter((user) => user.id !== userId);
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Помилка при видаленні користувача:', error);
    } finally {
      setLoading(false);
      handleCloseDialog();
    }
  };

  const handleOpenForm = () => {
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleAddUser = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${config.apiUrl}api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUserData),
      });

      const newUser = await response.json();

      setUsers([...users, newUser]);

      setNewUserData({ name: '', surname: '', position: '' });
      setOpenForm(false);
    } catch (error) {
      console.error('Помилка при додаванні користувача:', error);
    } finally {
      setLoading(false);
    }
  };

  const stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  const handleChange = (event, newValue) => {
    setCurrentTab(newValue);
    setSelectedPositionIndex(newValue);
    setShowContent(false);
  };

  return (
    <>
    {loading ? (
      <CircularProgress />
        ) : (
      <>
        <Typography variant="h3" gutterBottom>
          Користувачі
        </Typography>
        <Button 
          variant="contained"
          style={{ backgroundColor: '#47B972', margin: '0 auto 20px', maxWidth: '300px'}} 
          onClick={handleOpenForm}
        >
          Додати користувача
        </Button>

        <Dialog open={openForm} onClose={handleCloseForm}>
          <DialogTitle>Додати користувача</DialogTitle>
          <DialogContent>
            <StyledTextField
              label="Ім'я"
              value={newUserData.name}
              onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value.trim() })}
              fullWidth
              margin="normal"
            />
            <StyledTextField
              label="Прізвище"
              value={newUserData.surname}
              onChange={(e) => setNewUserData({ ...newUserData, surname: e.target.value.trim() })}
              fullWidth
              margin="normal" 
            />
            <Autocomplete
              options={positions.filter(pos => !pos.access)}
              getOptionLabel={(option) => option.name || ''}
              value={newUserData.position ? positions.find(pos => pos.name === newUserData.position) || '' : ''}
              loading={loadingPositions}
              onChange={(event, newValue) => setNewUserData({ ...newUserData, position: newValue.name })}
              renderInput={(params) => (
                <StyledTextField
                  {...params}
                  label="Посада"
                  fullWidth
                  margin="normal"
                />
              )}
            />
            <Button 
              variant="contained"
              style={{ backgroundColor: '#47B972', margin: '20px auto 0', maxWidth: '300px'}}
              onClick={handleAddUser}
              disabled={!newUserData.name || !newUserData.surname || !newUserData.position}
            >
              Додати
            </Button>
          </DialogContent>
        </Dialog>


          <TableContainer component={Paper} style={{ marginBottom: '40px' }}>
            <Table>
              <TableHead style={{ backgroundColor: '#A46941' }}>
                <TableRow>
                  <TableCell style={{ fontWeight: 'bold', color: '#fff' }}>
                    <TableSortLabel
                      active={orderBy === 'name'}
                      direction={orderBy === 'name' ? order : 'asc'}
                      onClick={() => handleSortRequest('name')}
                    >
                      Ім&#39;я
                    </TableSortLabel>
                  </TableCell>
                  <TableCell style={{ fontWeight: 'bold', color: '#fff' }}>
                    <TableSortLabel
                      active={orderBy === 'surname'}
                      direction={orderBy === 'surname' ? order : 'asc'}
                      onClick={() => handleSortRequest('surname')}
                    >
                      Прізвище
                    </TableSortLabel>
                  </TableCell>
                  <TableCell style={{ fontWeight: 'bold', color: '#fff' }}>
                    <TableSortLabel
                      active={orderBy === 'position'}
                      direction={orderBy === 'position' ? order : 'asc'}
                      onClick={() => handleSortRequest('position')}
                    >
                      Посада
                    </TableSortLabel>
                  </TableCell>
                  <TableCell style={{ fontWeight: 'bold', color: '#fff' }}>
                    <TableSortLabel
                      active={orderBy === 'position'}
                      direction={orderBy === 'position' ? order : 'asc'}
                      onClick={() => handleSortRequest('position')}
                    >
                      Відповіді
                    </TableSortLabel>
                  </TableCell>
                  <TableCell style={{ fontWeight: 'bold', color: '#fff' }}>
                    <TableSortLabel
                      active={orderBy === 'position'}
                      direction={orderBy === 'position' ? order : 'asc'}
                      onClick={() => handleSortRequest('position')}
                    >
                      Всі тести
                    </TableSortLabel>
                  </TableCell>
                  <TableCell style={{ fontWeight: 'bold', color: '#fff' }}>Пароль</TableCell>
                  <TableCell style={{ position: 'sticky', right: 0, color: '#fff', textAlign: 'center', fontWeight: 'bold', width: '10px', backgroundColor: '#A46941' }}>Видалити</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stableSort(users, getComparator(order, orderBy)).map((user) => (
                  <StyledTableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.surname}</TableCell>
                    <TableCell>{user.position}</TableCell>
                    <TableCell 
                      onClick={() => {
                        if (user.answer) {
                          handleOpenDetailsDialog(user);
                        }
                      }}
                      style={{cursor: 'pointer'}}
                    >
                      {user.answer ? user.answer.marks[user.answer.marks.length - 1] : 'відсутні'}
                    </TableCell>
                    <TableCell 
                      onClick={() => {
                        if (user.alltests) {
                          handleOpenAllTestsDialog(user);
                        }
                      }}
                      style={{cursor: 'pointer'}}
                    >
                      {user.alltests ? 'присутні' : 'відсутні'}
                    </TableCell>
                    <TableCell>{user.password}</TableCell>
                    <TableCell style={{ position: 'sticky', right: 0, backgroundColor: '#A46941', textAlign: 'center' }}>
                    <IconButton
                      aria-label="delete"
                      onClick={() => {
                        setSelectedUserId(user.id);
                        handleOpenDialog();
                      }}
                    >
                      <DeleteIcon style={{ color: '#fff'}}/>
                    </IconButton>
                    </TableCell>
                    <Dialog open={openDialog} onClose={handleCloseDialog}>
                      <DialogTitle>Підтвердження видалення</DialogTitle>
                      <DialogContent>
                        <p>Ви впевнені, що хочете видалити користувача?</p>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={handleCloseDialog} style={{ backgroundColor: '#47B972', color: '#fff'}}>
                          Скасувати
                        </Button>
                        <Button onClick={() => handleDeleteUser(selectedUserId)} color="error">
                          Видалити
                        </Button>
                      </DialogActions>
                    </Dialog>
                    <Dialog open={openDetailsDialog} onClose={handleCloseDetailsDialog}>
                      <DialogTitle>Деталі користувача</DialogTitle>
                      <DialogContent>
                        {selectedUser && (
                          <>
                            <div className='userBlock'>
                              <p>Ім'я: {selectedUser.name}</p>
                              <p>Прізвище: {selectedUser.surname}</p>
                              <p>Посада: {selectedUser.position}</p>
                              <p>Відповіді: {selectedUser.answer ? selectedUser.answer.marks[selectedUser.answer.marks.length - 1] : 'відсутні'}</p>
                            </div>
                            <div>
                              {positions
                                .filter(position => position.name === selectedUser.position)
                                .map((position, index) => (
                                  position.pool.map((question, questionIndex) => (
                                    <Accordion key={questionIndex} style={{ padding: '20px', marginBottom: '20px' }}>
                                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="h6" className='title-question'>
                                          {question.question}
                                        </Typography>
                                      </AccordionSummary>
                                      <List>
                                        {Object.entries(question.options).map(([optionText, optionValue], optionIndex) => (
                                          <ListItem key={optionIndex}>
                                            <ListItemIcon>
                                              <FiberManualRecordIcon style={{ color: optionValue ? 'green' : 'red' }} />
                                            </ListItemIcon>
                                            <ListItemText primary={optionText} />
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                              {selectedUser.answer.results.map((result, resultIndex) => (
                                                <div key={resultIndex}>
                                                  {result[questionIndex] && (
                                                    <FiberManualRecordIcon style={{ color: result[questionIndex][optionIndex] ? '#A46941' : 'eee', marginRight: '5px' }} />
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          </ListItem>
                                        ))}
                                      </List>
                                    </Accordion>
                                  ))
                                ))}
                            </div>

                          </>
                        )}
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={handleCloseDetailsDialog} style={{ backgroundColor: '#47B972', color: '#fff'}}>
                          Закрити
                        </Button>
                      </DialogActions>
                    </Dialog>

                    <Dialog open={openAllTestsDialog} onClose={handleCloseAllTestsDialog}>
                      <DialogTitle>Результати всіх тестів</DialogTitle>
                      <DialogContent>
                        {selectedUser && selectedUser.alltests && (
                          <>
                            <div className='userBlock'>
                              <p>Ім'я: {selectedUser.name}</p>
                              <p>Прізвище: {selectedUser.surname}</p>
                              <p>Посада: {selectedUser.position}</p>
                              <p>Відповіді: {selectedUser.alltests ? 'присутні' : 'відсутні'}</p>
                            </div>
                            {Object.entries(selectedUser.alltests).map(([positionName, positionData], index) => (
                              <Accordion key={index}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                  <Typography variant="h6">{positionName}</Typography>
                                  <Typography variant="h7">
                                    оцінка: {positionData.marks[positionData.marks.length - 1]}
                                  </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                  {/* Отримуємо доступні позиції тестування для поточного користувача */}
                                  {positions
                                    .filter(position => position.name === positionName && position.access)
                                    .map((position, index) => (
                                      // Мапимо питання з пулу кожної доступної позиції
                                      position.pool.map((question, questionIndex) => (
                                        <Accordion key={questionIndex} style={{ padding: '20px', marginBottom: '20px' }}>
                                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography variant="h6" className='title-question'>
                                              {question.question}
                                            </Typography>
                                          </AccordionSummary>
                                          <List>
                                            {/* Мапимо опції кожного питання */}
                                            {Object.entries(question.options).map(([optionText, optionValue], optionIndex) => (
                                              <ListItem key={optionIndex}>
                                                <ListItemIcon>
                                                  <FiberManualRecordIcon style={{ color: optionValue ? 'green' : 'red' }} />
                                                </ListItemIcon>
                                                <ListItemText primary={optionText} />
                                                {/* Отримуємо відповіді користувача на питання з відповідного пулу */}
                                                {positionData.results.map((result, resultIndex) => (
                                                  <div key={resultIndex} style={{ display: 'flex', alignItems: 'center' }}>
                                                    {result[questionIndex] && (
                                                      <FiberManualRecordIcon style={{ color: result[questionIndex][optionIndex] ? '#A46941' : 'eee', marginRight: '5px' }} />
                                                    )}
                                                  </div>
                                                ))}
                                              </ListItem>
                                            ))}
                                          </List>
                                        </Accordion>
                                      ))
                                    ))}
                                </AccordionDetails>
                              </Accordion>
                            ))}
                          </>
                        )}
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={handleCloseAllTestsDialog} style={{ backgroundColor: '#47B972', color: '#fff'}}>
                          Закрити
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <>
            <Typography variant="h3" gutterBottom>
              Інформація для питань
            </Typography>
            <Box sx={{ maxWidth: '100%', backgroundColor: '#FFF', borderRadius: '5px' }}>
              <MyTabs value={currentTab} onChange={handleChange} variant="scrollable" scrollButtons allowScrollButtonsMobile>
                {positions.map((position, index) => (
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
            {positions.map((position, index) => (
              <div key={index} hidden={selectedPositionIndex !== index} style={{ width: '100%' }}>
                <input 
                  type="file" 
                  onChange={(event) => handleFileChange(index, event)} 
                  style={{ color: 'black' }}
                  value={selectedFileName}
                  accept=".doc,.docx"
                  disabled={fileLoading} 
                />
                <Button 
                  onClick={() => handleSaveContent(index)}
                  variant="contained"
                  style={{ backgroundColor: '#47B972', margin: '20px auto 20px', maxWidth: '300px'}}
                  disabled={fileLoading} 
                >
                  {fileLoading ? <CircularProgress size={24} color="inherit" /> : 'Додати'}
                </Button>
                <div>
                  <Button 
                    onClick={handleShowContent}
                    variant="contained"
                    style={{ backgroundColor: '#47B972', margin: '20px auto 20px', maxWidth: '300px'}}
                  >
                    {showContent ? 'Скрити файл' : 'Показати файл'}
                  </Button>
                  {showContent && selectedPositionIndex === index && <IframeViewer positionName={position.name} />}
                </div>
              </div>
            ))}
          </>
        </>
      )}
    </>
  );
}

export default Users;
