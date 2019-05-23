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

#### calibration-completed
- technician [string]
- notes [string]

#### ultrasonic-cleaning-completed
- technician [string]

#### assembly-completed
- technician [string]

#### packing-completed
- technician [string]

#### shipped
- technician [string]
- courier [string]
- tracking-number [string]

#### manufacturing-halted
- technician [string]
- reason [string]
