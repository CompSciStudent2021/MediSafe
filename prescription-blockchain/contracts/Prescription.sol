// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Prescription {
    struct PrescriptionData {
        uint256 id;
        string patientId;
        string doctorId;
        string medicationName;
        string dosage;
        string frequency;
        string duration;
        uint256 timestamp;
        bool isActive;
        string notes;
    }
    
    mapping(uint256 => PrescriptionData) public prescriptions;
    uint256 public prescriptionCount = 0;
    
    event PrescriptionCreated(
        uint256 id,
        string patientId,
        string doctorId,
        string medicationName,
        uint256 timestamp
    );
    
    event PrescriptionUpdated(
        uint256 id,
        bool isActive
    );
    
    function createPrescription(
        string memory _patientId,
        string memory _doctorId,
        string memory _medicationName,
        string memory _dosage,
        string memory _frequency,
        string memory _duration,
        string memory _notes
    ) public returns (uint256) {
        prescriptionCount++;
        
        prescriptions[prescriptionCount] = PrescriptionData({
            id: prescriptionCount,
            patientId: _patientId,
            doctorId: _doctorId,
            medicationName: _medicationName,
            dosage: _dosage,
            frequency: _frequency,
            duration: _duration,
            timestamp: block.timestamp,
            isActive: true,
            notes: _notes
        });
        
        emit PrescriptionCreated(
            prescriptionCount,
            _patientId,
            _doctorId,
            _medicationName,
            block.timestamp
        );
        
        return prescriptionCount;
    }
    
    function getPrescription(uint256 _id) public view returns (
        uint256 id,
        string memory patientId,
        string memory doctorId,
        string memory medicationName,
        string memory dosage,
        string memory frequency,
        string memory duration,
        uint256 timestamp,
        bool isActive,
        string memory notes
    ) {
        require(_id > 0 && _id <= prescriptionCount, "Prescription does not exist");
        PrescriptionData storage p = prescriptions[_id];
        
        return (
            p.id,
            p.patientId,
            p.doctorId,
            p.medicationName,
            p.dosage,
            p.frequency,
            p.duration,
            p.timestamp,
            p.isActive,
            p.notes
        );
    }
    
    function togglePrescriptionStatus(uint256 _id) public {
        require(_id > 0 && _id <= prescriptionCount, "Prescription does not exist");
        
        prescriptions[_id].isActive = !prescriptions[_id].isActive;
        
        emit PrescriptionUpdated(_id, prescriptions[_id].isActive);
    }
    
    function getPrescriptionsCount() public view returns (uint256) {
        return prescriptionCount;
    }
}