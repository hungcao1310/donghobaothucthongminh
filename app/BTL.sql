/* TRANG CODE KH?I T?O CO S? D? LI?U H? TH?NG BÁO TH?C
   - Ðã chu?n hóa 3NF
   - Ðã x? lý quan h? Nhi?u-Nhi?u gi?a Alarm và Mission
*/

-- 1. T?o Database
USE master;
GO
IF EXISTS (SELECT * FROM sys.databases WHERE name = 'AlarmSystemDB')
    DROP DATABASE AlarmSystemDB;
GO
CREATE DATABASE AlarmSystemDB;
GO
USE AlarmSystemDB;
GO

-- 2. T?o b?ng Ngu?i dùng (User)
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    UserName NVARCHAR(100) NOT NULL,
    Email VARCHAR(150) UNIQUE NOT NULL,
    Password NVARCHAR(255) NOT NULL,
    FullName NVARCHAR(200),
    Phone VARCHAR(20),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- 3. T?o b?ng C?u hình âm thanh (SoundConfig)
CREATE TABLE SoundConfigs (
    SoundConfigID INT PRIMARY KEY IDENTITY(1,1),
    RingtonePath NVARCHAR(MAX) NOT NULL,
    IsSmartRise BIT DEFAULT 0
);
INSERT INTO SoundConfigs (RingtonePath, IsSmartRise)
VALUES
(N'music/bao thuc 1.mp3', 0),
(N'music/bao thuc 2.mp3', 0),
(N'music/bao thuc 3.mp3', 0),
(N'music/bao thuc 4.mp3', 0),
(N'music/bao thuc 5.mp3', 0),
(N'music/bao thuc 6.mp3', 0),
(N'music/bao thuc 7.mp3', 0),
(N'music/bao thuc 9.mp3', 0),
(N'music/bao thuc 10.mp3', 0);

-- 4. T?o b?ng Nhi?m v? (Mission)
CREATE TABLE Missions (
    MissionID INT PRIMARY KEY IDENTITY(1,1),
    MissionType NVARCHAR(50) NOT NULL,
    Difficulty INT CHECK (Difficulty BETWEEN 1 AND 5),
    CompletionThreshold INT DEFAULT 1
);

-- 5. T?o b?ng Báo th?c (Alarm)
CREATE TABLE Alarms (
    AlarmID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    SoundConfigID INT NOT NULL,
    AlarmTime TIME NOT NULL,
    Label NVARCHAR(100),
    IsActive BIT DEFAULT 1,
    RepeatCycle VARCHAR(50),
    CONSTRAINT FK_Alarm_User FOREIGN KEY (UserID)
        REFERENCES Users(UserID) ON DELETE CASCADE,
    CONSTRAINT FK_Alarm_Sound FOREIGN KEY (SoundConfigID)
        REFERENCES SoundConfigs(SoundConfigID) ON DELETE CASCADE
);

-- 6. B?ng trung gian: Báo th?c - Nhi?m v? (Alarm_Mission)
CREATE TABLE Alarm_Mission (
    AlarmID INT NOT NULL,
    MissionID INT NOT NULL,
    PRIMARY KEY (AlarmID, MissionID),
    CONSTRAINT FK_AM_Alarm FOREIGN KEY (AlarmID)
        REFERENCES Alarms(AlarmID) ON DELETE CASCADE,
    CONSTRAINT FK_AM_Mission FOREIGN KEY (MissionID)
        REFERENCES Missions(MissionID) ON DELETE CASCADE
);
GO

-- 7. D? li?u m?u
INSERT INTO Users (UserName, Email, Password, FullName) VALUES (N'Nguy?n Van A', 'vana@example.com', '123456', N'Nguy?n Van A');
INSERT INTO SoundConfigs (RingtonePath, IsSmartRise) VALUES ('/sounds/heavy-metal.mp3', 1);
INSERT INTO Missions (MissionType, Difficulty, CompletionThreshold) VALUES (N'Gi?i Toán', 3, 5);
INSERT INTO Alarms (UserID, SoundConfigID, AlarmTime, Label, RepeatCycle)
VALUES (1, 1, '06:30:00', N'Báo th?c di h?c', 'Mon,Tue,Wed,Thu,Fri');
INSERT INTO Alarm_Mission (AlarmID, MissionID) VALUES (1, 1);

SELECT * FROM Users;
SELECT * FROM Alarms;
SELECT * FROM SoundConfigs;
GO
