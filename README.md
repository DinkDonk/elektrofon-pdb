Elektrofon PDB
==============

### Installation

```bash
$ yarn install
```

### Start scanner app

```bash
$ yarn start
```

### Generate serials

```bash
$ node src/generate-serials.js [identifier [count]]
```

### Generate QRcodes

```bash
$ node src/generate-qrcodes.js
```

### Generate PDB site

```bash
$ node src/generate-site.js
```

### Deploying PDB site

```bash
$ yarn run deploy
```

### Mass injection of event
You can inject events on all items in the database by using `mass-inject-event.js` like this:

```bash
$ node src/mass-inject-event.js '{"name": "power-on-test-completed","time":"2019-05-23T20:52:00.000Z","data":{"technician":"Rune Warhuus","notes":"3.3V, 13V, 1V and 1.25V tested OK"}}'
```

`mass-inject-event.js` can take an optional list of serial numbers to mask event injection. Example of only updating serials `rktfr2223d` and `wze3r8hsg5:

```bash
$ node src/mass-inject-event.js '{"name": "power-on-test-completed","time":"2019-05-23T20:52:00.000Z","data":{"technician":"Rune Warhuus","notes":"3.3V, 13V, 1V and 1.25V tested OK"}}' rktfr2223d wze3r8hsg5
```


### Available events

- pcb-received
- pcb-inspected
- pick-and-place-completed
- reflow-completed
- power-connector-soldered
- power-on-test-completed
- manual-soldering-completed
- programming-completed
- calibration-completed
- ultrasonic-cleaning-completed
- assembly-completed
- packing-completed
- shipped
- manufacturing-halted
- problem-resolved

### Event data
All events has `name`, `time` and `data` attributes.
The following is the `data` properties for all events:

#### pcb-received
- manufacturer [string]
- notes [string]

#### pcb-inspected
- inspector [string]

#### pick-and-place-completed
- technician [string]

#### reflow-completed
- technician [string]

#### manual-soldering-completed
- technician [string]
- notes [string]

#### power-on-test-completed
- technician [string]
- notes [string]

#### programming-completed
- technician [string]
- notes [string]

#### calibration-completed
- technician [string]
- notes [string]

#### ultrasonic-cleaning-completed
- technician [string]

#### subassembly-completed
- technician [string]
- subassembly [string]

#### assembly-completed
- technician [string]

#### packing-completed
- technician [string]

#### shipped
- technician [string]
- to [string]
- courier [string]
- tracking-number [string]

#### manufacturing-halted
- technician [string]
- reason [string]

#### problem-resolved
- technician [string]
- solution [string]
