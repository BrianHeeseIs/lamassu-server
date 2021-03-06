import { makeStyles } from '@material-ui/core'
import classnames from 'classnames'
import FileSaver from 'file-saver'
import moment from 'moment'
import * as R from 'ramda'
import React, { useState, useCallback } from 'react'

import { ReactComponent as Arrow } from 'src/styling/icons/arrow/download_logs.svg'
import { primaryColor, offColor, zircon } from 'src/styling/variables'

import Popper from './Popper'
import { Link } from './buttons'
import DateRangePicker from './date-range-picker/DateRangePicker'
import { RadioGroup } from './inputs'
import typographyStyles from './typography/styles'

const { info1, label1, label2, h4 } = typographyStyles

const dateContainerStyles = {
  wrapper: {
    height: 46,
    width: 99
  },
  container: {
    display: 'flex'
  },
  monthWeekDayContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    extend: label1,
    lineHeight: 1.33,
    color: primaryColor
  },
  bigNumber: {
    extend: info1,
    lineHeight: 1,
    marginRight: 7
  },
  monthYear: {
    extend: label2,
    lineHeight: 1.17,
    color: primaryColor
  },
  weekDay: {
    extend: label1,
    lineHeight: 1.33,
    color: offColor
  }
}

const dateContainerUseStyles = makeStyles(dateContainerStyles)

const DateContainer = ({ date, children, ...props }) => {
  const classes = dateContainerUseStyles()

  return (
    <div className={classes.wrapper}>
      <div className={classes.label}>{children}</div>
      {date && (
        <>
          <div className={classes.container}>
            <div className={classes.bigNumber}>{date.format('D')}</div>
            <div className={classes.monthWeekDayContainer}>
              <span className={classes.monthYear}>{`${date.format(
                'MMM'
              )} ${date.format('YYYY')}`}</span>
              <span className={classes.weekDay}>{date.format('dddd')}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const styles = {
  popoverContent: {
    width: 272
  },
  popoverHeader: {
    extend: h4,
    padding: [[15, 15, 0, 15]]
  },
  radioButtonsContainer: {
    padding: [[5, 15, 5, 15]]
  },
  radioButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    color: primaryColor
  },
  dateRangePickerShowing: {
    display: 'block',
    height: '100%'
  },
  dateRangePickerHidden: {
    display: 'none',
    height: 0
  },
  download: {
    padding: [[10, 15]]
  },
  dateContainerWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: zircon,
    padding: [[0, 15]],
    minHeight: 70
  },
  arrowContainer: {
    position: 'absolute',
    left: 116,
    top: 26
  },
  arrow: {
    margin: 'auto'
  }
}

const useStyles = makeStyles(styles)

const LogsDownloaderPopover = ({
  id,
  name,
  open,
  anchorEl,
  getTimestamp,
  logs,
  title
}) => {
  const radioButtonAll = 'all'
  const radioButtonRange = 'range'

  const [selectedRadio, setSelectedRadio] = useState(radioButtonAll)
  const [range, setRange] = useState(null)

  const classes = useStyles()

  const dateRangePickerClasses = {
    [classes.dateRangePickerShowing]: selectedRadio === radioButtonRange,
    [classes.dateRangePickerHidden]: selectedRadio === radioButtonAll
  }

  const handleRadioButtons = R.o(setSelectedRadio, R.path(['target', 'value']))

  const handleRangeChange = useCallback(
    (from, to) => {
      setRange({ from, to })
    },
    [setRange]
  )

  const downloadLogs = (range, logs) => {
    if (!range) return

    if (range.from && !range.to) range.to = moment()

    const formatDateFile = date => {
      return moment(date).format('YYYY-MM-DD_HH-mm')
    }

    if (selectedRadio === radioButtonAll) {
      const text = logs.map(it => JSON.stringify(it)).join('\n')
      const blob = new window.Blob([text], {
        type: 'text/plain;charset=utf-8'
      })
      FileSaver.saveAs(blob, `${formatDateFile(new Date())}_${name}`)
      return
    }

    if (selectedRadio === radioButtonRange) {
      const text = logs
        .filter(log =>
          moment(getTimestamp(log)).isBetween(range.from, range.to, 'day', '[]')
        )
        .map(it => JSON.stringify(it))
        .join('\n')
      const blob = new window.Blob([text], {
        type: 'text/plain;charset=utf-8'
      })
      FileSaver.saveAs(
        blob,
        `${formatDateFile(range.from)}_${formatDateFile(range.to)}_${name}`
      )
    }
  }

  const radioButtonOptions = [
    { display: 'All logs', code: radioButtonAll },
    { display: 'Date range', code: radioButtonRange }
  ]

  return (
    <Popper id={id} open={open} anchorEl={anchorEl} placement="bottom">
      <div className={classes.popoverContent}>
        <div className={classes.popoverHeader}>{title}</div>
        <div className={classes.radioButtonsContainer}>
          <RadioGroup
            name="logs-select"
            value={selectedRadio}
            options={radioButtonOptions}
            ariaLabel="logs-select"
            onChange={handleRadioButtons}
            className={classes.radioButtons}
          />
        </div>
        {selectedRadio === radioButtonRange && (
          <div className={classnames(dateRangePickerClasses)}>
            <div className={classes.dateContainerWrapper}>
              {range && (
                <>
                  <DateContainer date={range.from}>From</DateContainer>
                  <div className={classes.arrowContainer}>
                    <Arrow className={classes.arrow} />
                  </div>
                  <DateContainer date={range.to}>To</DateContainer>
                </>
              )}
            </div>
            <DateRangePicker
              maxDate={moment()}
              onRangeChange={handleRangeChange}
            />
          </div>
        )}
        <div className={classes.download}>
          <Link color="primary" onClick={() => downloadLogs(range, logs)}>
            Download
          </Link>
        </div>
      </div>
    </Popper>
  )
}

export default LogsDownloaderPopover
