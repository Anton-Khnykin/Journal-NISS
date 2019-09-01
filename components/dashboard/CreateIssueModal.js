import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import WithMobileDialog from 'components/WithMobileDialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { replaceChar, isFieldEmpty } from 'utils/validation';
import { getVolumes } from 'middleware/api/secretary';

function CreateIssueModal(props) {
  const { open, value, onClose, onSubmit, title, submitAction } = props;
  const [ volumes, setVolumes ] = useState([]);
  const [ values, setValues ] = useState({
    volume: value ? value.volume : '',
    number: value ? value.number : ''
  });
  const [ error, setError ] = useState({
    volume: null,
    number: null
  });

  useEffect(() => {
    getVolumes()
      .then(res => setVolumes(res));
  }, []);

  const isDataValid = () => {
    let errors = {};
    isFieldEmpty('volume', values.volume, errors);
    isFieldEmpty('number', values.number, errors);
    setError(errors);
    return !Object.values(errors).some(error => error);
  }

  const handleChange = ({ target: { name, value } }) => {
    let errors = {};
    isFieldEmpty(name, value.toString(), errors);
    setError(errors);
    setValues({ ...values, [name]: replaceChar(value.toString()) });
  }

  const onSaveClick = () => {
    if (!isDataValid()) {
      return;
    }
    onSubmit(values);
  }

  return (
    <WithMobileDialog
      maxWidth="xs"
      open={open}
      onClose={onClose}
      title={title || "Подтвердите\xa0данные"}
    >
      <DialogContent dividers>
        <FormControl
          fullWidth
          margin="dense"
          error={!!error.volume}
          required
        >
          <InputLabel htmlFor="volume_id">
            { error.volume || 'Том' }
          </InputLabel>
          <Select
            required
            value={values.volume}
            onChange={handleChange}
            inputProps={{
              name: 'volume',
              id: 'volume_id'
            }}
          >
            { volumes.map(volume => (
              <MenuItem
                key={volume.volume_id}
                value={volume.volume_id}
              >
                { volume.number}&nbsp;({volume.year} )
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          required
          error={!!error.number}
          fullWidth
          label={error.number || "Номер"}
          margin="dense"
          name="number"
          value={values.number}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Отмена
        </Button>
        <Button color="primary" onClick={onSaveClick}>
          { submitAction || 'Сохранить' }
        </Button>
      </DialogActions>
    </WithMobileDialog>
  );
}

CreateIssueModal.propTypes = {
  open: PropTypes.bool.isRequired,
  value: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
  submitAction: PropTypes.string
}

export default CreateIssueModal;
