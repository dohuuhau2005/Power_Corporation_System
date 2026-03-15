--3 instance 1 TongBo ( trigger copy sang 2 TP)
--admin 123456
--TP1 : NV1 123456
--TP2 : NV2 123456









create database UsersCsdlPt;
use UsersCsdlPt
--rieneg 1 db
create table Users(
	MaNV VARCHAR(20) Primary Key,
	Email varchar(200) ,
	Password varchar(512),
	Role varchar(30),
	Salt varchar(100)
	);
	insert into Users values ('root','admin@gmail.com','1c4824c1a7e206c9e614e8bc3c6205deebcf678d440fa7f3f45d6eb3f7f1a4ed3b85127ec91ad206776dbe75bc0fab88822ef91c7fea517da7abd7758e6f07c9','admin','abc')--admin admin
	drop table Users

create table lichSuChuyenCongTac(
id INT IDENTITY PRIMARY KEY,
	MaNV VARCHAR(20) ,
	MaKH VARCHAR(20),
	NgayChuyen datetime default GETDATE(),
	maCNCu VARCHAR(20),
	maCNMoi VARCHAR(20)
	)
create database DienLuc
use DienLuc
-- 1. B?ng chinhanh
CREATE TABLE chinhanh (
    maCN VARCHAR(20) PRIMARY KEY,
    tenCN NVARCHAR(255) NOT NULL,--
    thanhpho VARCHAR(100)
);


-- 2. B?ng nhanvien
CREATE TABLE nhanvien (
    maNV VARCHAR(20) PRIMARY KEY,
    hoten NVARCHAR(255) NOT NULL,
    maCN VARCHAR(20),
    FOREIGN KEY (maCN) REFERENCES chinhanh(maCN)
);

-- 3. B?ng khachhang
CREATE TABLE khachhang (
    maKH VARCHAR(20) PRIMARY KEY,
    tenKH NVARCHAR(255) NOT NULL,
    maCN VARCHAR(20),
    FOREIGN KEY (maCN) REFERENCES chinhanh(maCN)
);

-- 4. B?ng hopdong
CREATE TABLE hopdong (
    soHD VARCHAR(26) PRIMARY KEY,
    ngayKy DATE default GETDATE(),
    maKH VARCHAR(20),--ko can khoa ngoai
    soDienKe VARCHAR(50),
    kwDinhMuc INT,
    dongiaKW int, -- Gi? ??nh ??n giá là ki?u s? th?p phân
	isPaid bit default 0,
 
);

-- 5. B?ng hoadon
CREATE TABLE hoadon (
    soHDN VARCHAR(26) PRIMARY KEY,
    thang INT,
    nam INT,
    soHD VARCHAR(26),
    maNV VARCHAR(20),--khong can khoa ngoai
    soTien int, 
    thanhToan bit default 0;
    FOREIGN KEY (soHD) REFERENCES hopdong(soHD),

);


-- TP1 fragment
INSERT INTO chinhanh VALUES 
('CN1', N'Chi nhánh 1 - TP1', 'TP1'),
('CN3', N'Chi nhánh 3 - TP1', 'TP1');
select * from chinhanh
INSERT INTO nhanvien VALUES 
('NV1', N'Nguyễn Văn Anh', 'CN1'),
('NV2', N'Lê Thị Bằng', 'CN3');

--test
use DienLuc select * from nhanvien,chinhanh where maNV = 'NV6' and nhanvien.maCN = chinhanh.maCN
use DienLuc SELECT *  FROM khachhang,nhanvien where khachhang.maCN=nhanvien.maCN and nhanvien.maNV='NV6'


INSERT INTO khachhang VALUES 
('KH1', N'Trần Văn Hào', 'CN1'),
('KH2', N'Phạm Thị Huy', 'CN3');

INSERT INTO hopdong VALUES 
('HD1', '2024-01-10', 'KH1', 'DK001', 500, 2500),
('HD2', '2024-02-12', 'KH2', 'DK002', 450, 2600);

INSERT INTO hoadon VALUES 
('HDN1', 1, 2025, 'HD1', 'NV1', 1250000),
('HDN2', 2, 2025, 'HD2', 'NV2', 1170000);





-- TP2 fragment
INSERT INTO chinhanh VALUES 
('CN2', N'Chi nhánh 2 - TP2', 'TP2'),
('CN4', N'Chi nhánh 4 - TP2', 'TP2');

INSERT INTO nhanvien VALUES 
('NV3', N'Hoàng Văn E', 'CN2'),
('NV4', N'Đặng Thị F', 'CN4');

INSERT INTO khachhang VALUES 
('KH3', N'Lý Văn G', 'CN2'),
('KH4', N'Ngô Thị H', 'CN4');

INSERT INTO hopdong VALUES 
('HD3', '2024-03-15', 'KH3', 'DK003', 400, 2400),
('HD4', '2024-04-20', 'KH4', 'DK004', 350, 2550);

INSERT INTO hoadon VALUES 
('HDN3', 3, 2025, 'HD3', 'NV3', 960000),
('HDN4', 4, 2025, 'HD4', 'NV4', 765000);





-- TP3 fragment
INSERT INTO chinhanh VALUES 
('CN5', N'Chi nhánh 5 - TP3', 'TP3');

INSERT INTO nhanvien VALUES 
('NV5', N'Phan Văn I', 'CN5'),
('NV6', N'Phan Văn Lâm', 'CN5');
INSERT INTO khachhang VALUES 
('KH5', N'Đỗ Thị K', 'CN5'),
('KH6', N'Đỗ Thị Mĩ', 'CN5'),
('KH7', N'Mĩ Thị Xuân', 'CN5'),
('KH8', N'Lâm Thị Trần', 'CN5');
INSERT INTO hopdong VALUES 
('HD5', '2024-05-25', 'KH5', 'DK005', 300, 2500),
('HD6', '2024-05-25', 'KH6', 'DK005', 350, 3000),
('HD7', '2024-05-25', 'KH7', 'DK005', 200, 2500),
('HD8', '2024-05-25', 'KH8', 'DK005', 600, 3000);
INSERT INTO hoadon VALUES 
('HDN5', 5, 2025, 'HD5', 'NV5', 750000),
('HDN6', 5, 2025, 'HD5', 'NV5', 3000000),
('HDN7', 5, 2025, 'HD5', 'NV6', 4000000),
('HDN8', 5, 2025, 'HD5', 'NV5', 500000);

select hoadon.soHDN,hoadon.maKH,hopdong.kwDinhMuc,kwSuDung from hoadon,hopdong,

CREATE LOGIN groupcsdlpt 
WITH PASSWORD = 'CsdlPTDeployed@2025',
CHECK_POLICY = OFF,
CHECK_EXPIRATION = OFF;

ALTER SYSTEM SET db_create_file_dest = 'D:\OracleDataDienLuc';
SELECT name FROM v$datafile WHERE name LIKE '%pdbseed%';

-- 1. Tạo Pluggable Database có tên là TongBo -- tổng bộ
CREATE PLUGGABLE DATABASE TongBo 
ADMIN USER admin_tongbo IDENTIFIED BY 123456 
ROLES = (DBA);

-- 2. Mở PDB TongBo lên để hoạt động
ALTER PLUGGABLE DATABASE TongBo OPEN;

-- 3. CHUYỂN SESSION (Cực kỳ quan trọng): Nhảy vào bên trong PDB TongBo vừa tạo
ALTER SESSION SET CONTAINER = TongBo;

-- 4. Tạo Tablespace DIENLUCTONG bên trong PDB TongBo
CREATE TABLESPACE DIENLUCTONG 
DATAFILE 'dienluctong_data01.dbf' SIZE 100M 
AUTOEXTEND ON NEXT 50M MAXSIZE UNLIMITED;

-- 5. Tạo một User (Schema) quản lý dự án này và cấp quyền
CREATE USER db_dienluc IDENTIFIED BY 123456 
DEFAULT TABLESPACE DIENLUCTONG 
QUOTA UNLIMITED ON DIENLUCTONG;

GRANT CONNECT, RESOURCE, CREATE VIEW TO db_dienluc;




-- 1. Bảng chinhanh
CREATE TABLE chinhanh (
    maCN VARCHAR2(20) PRIMARY KEY,
    tenCN NVARCHAR2(255) NOT NULL,
    thanhpho VARCHAR2(100)
) TABLESPACE DIENLUCTONG;

-- 2. Bảng nhanvien
CREATE TABLE nhanvien (
    maNV VARCHAR2(20) PRIMARY KEY,
    hoten NVARCHAR2(255) NOT NULL,
    maCN VARCHAR2(20),
    FOREIGN KEY (maCN) REFERENCES chinhanh(maCN)
) TABLESPACE DIENLUCTONG;

-- 3. Bảng khachhang
CREATE TABLE khachhang (
    maKH VARCHAR2(20) PRIMARY KEY,
    tenKH NVARCHAR2(255) NOT NULL,
    maCN VARCHAR2(20),
    FOREIGN KEY (maCN) REFERENCES chinhanh(maCN)
) TABLESPACE DIENLUCTONG;

-- 4. Bảng hopdong
CREATE TABLE hopdong (
    soHD VARCHAR2(26) PRIMARY KEY,
    ngayKy DATE DEFAULT SYSDATE,
    maKH VARCHAR2(20), -- Không khóa ngoại như bạn dặn
    soDienKe VARCHAR2(50),
    kwDinhMuc NUMBER,
    dongiaKW NUMBER, 
    isPaid NUMBER(1) DEFAULT 0 -- Oracle dùng NUMBER(1) thay cho kiểu bit
) TABLESPACE DIENLUCTONG;

-- 5. Bảng hoadon
CREATE TABLE hoadon (
    soHDN VARCHAR2(26) PRIMARY KEY,
    thang NUMBER,
    nam NUMBER,
    soHD VARCHAR2(26),
    maNV VARCHAR2(20), -- Không khóa ngoại như bạn dặn
    soTien NUMBER, 
    thanhToan NUMBER(1) DEFAULT 0,
    FOREIGN KEY (soHD) REFERENCES hopdong(soHD)
) TABLESPACE DIENLUCTONG;

-- Tạo archive tên là fda_1nam, lưu trữ trên tablespace USERS, giữ data 1 năm
CREATE FLASHBACK ARCHIVE fda_1nam 
TABLESPACE DIENLUCTONG 
RETENTION 1 YEAR;



--TP1
-- 1. Tạo Pluggable Database có tên là TP1 -- Thanh pho 1
CREATE PLUGGABLE DATABASE TP1 
ADMIN USER admin_TP1 IDENTIFIED BY 123456 
ROLES = (DBA);
-- 2. Mở PDB TP1 lên để hoạt động
ALTER PLUGGABLE DATABASE TP1 OPEN;
-- 3. CHUYỂN SESSION (Cực kỳ quan trọng): Nhảy vào bên trong PDB TongBo vừa tạo
ALTER SESSION SET CONTAINER = TP1;

--CN1


-- 4. Tạo Tablespace DIENLUCTONG bên trong PDB TP1
CREATE TABLESPACE CN1 
DATAFILE 'CN1_TP1_data01.dbf' SIZE 100M 
AUTOEXTEND ON NEXT 50M MAXSIZE UNLIMITED;

CREATE TABLESPACE CN3
DATAFILE 'CN3_TP1_data01.dbf' SIZE 100M 
AUTOEXTEND ON NEXT 50M MAXSIZE UNLIMITED;

-- 5. Tạo một User (Schema) quản lý dự án này và cấp quyền
CREATE USER db_dienlucCN1 IDENTIFIED BY 123456 
DEFAULT TABLESPACE CN1 
QUOTA UNLIMITED ON CN1;

GRANT CONNECT, RESOURCE, CREATE VIEW TO db_dienlucCN1;


CREATE USER db_dienlucCN3 IDENTIFIED BY 123456 
DEFAULT TABLESPACE CN3
QUOTA UNLIMITED ON CN3;

GRANT CONNECT, RESOURCE, CREATE VIEW TO db_dienlucCN3;
-- Chuyển ngữ cảnh để các bảng tạo ra thuộc về user này
ALTER SESSION SET CURRENT_SCHEMA = db_dienlucCN1;

ALTER SESSION SET CURRENT_SCHEMA = db_dienlucCN3;




-- 1. Bảng chinhanh
CREATE TABLE chinhanh (
    maCN VARCHAR2(20) PRIMARY KEY,
    tenCN NVARCHAR2(255) NOT NULL,
    thanhpho VARCHAR2(100)
) ;

-- 2. Bảng nhanvien
CREATE TABLE nhanvien (
    maNV VARCHAR2(20) PRIMARY KEY,
    hoten NVARCHAR2(255) NOT NULL,
    maCN VARCHAR2(20),
    FOREIGN KEY (maCN) REFERENCES chinhanh(maCN)
) ;

-- 3. Bảng khachhang
CREATE TABLE khachhang (
    maKH VARCHAR2(20) PRIMARY KEY,
    tenKH NVARCHAR2(255) NOT NULL,
    maCN VARCHAR2(20),
    FOREIGN KEY (maCN) REFERENCES chinhanh(maCN)
) ;

-- 4. Bảng hopdong
CREATE TABLE hopdong (
    soHD VARCHAR2(26) PRIMARY KEY,
    ngayKy DATE DEFAULT SYSDATE,
    maKH VARCHAR2(20), -- Không khóa ngoại như bạn dặn
    soDienKe VARCHAR2(50),
    kwDinhMuc NUMBER,
    dongiaKW NUMBER, 
    isPaid NUMBER(1) DEFAULT 0 -- Oracle dùng NUMBER(1) thay cho kiểu bit
);

-- 5. Bảng hoadon
CREATE TABLE hoadon (
    soHDN VARCHAR2(26) PRIMARY KEY,
    thang NUMBER,
    nam NUMBER,
    soHD VARCHAR2(26),
    maNV VARCHAR2(20), -- Không khóa ngoại như bạn dặn
    soTien NUMBER, 
    thanhToan NUMBER(1) DEFAULT 0,
    FOREIGN KEY (soHD) REFERENCES hopdong(soHD)
) 
;

--tạo data link
-- 1. Chuyển về Tổng bộ (Thay tên PDB_TONGBO bằng tên thực tế của ông, hoặc để nguyên nếu Tổng bộ là gốc)
ALTER SESSION SET CONTAINER =TongBo; 
-- Hoặc ALTER SESSION SET CONTAINER = PDB_TONGBO;

-- 2. Tạo Database Link
-- Tui dùng cú pháp Easy Connect (IP:Port/Service_Name) cho ông khỏi phải config file tnsnames.ora mệt mỏi.
-- Đổi 'localhost' thành IP thật nếu server chạy khác máy nhé.
CREATE DATABASE LINK link_to_cn1
CONNECT TO db_dienlucCN1 IDENTIFIED BY "123456"
USING '//localhost:1521/TP1';

CREATE DATABASE LINK link_to_cn3
CONNECT TO db_dienlucCN3 IDENTIFIED BY "123456"
USING '//localhost:1521/TP1';




--TP2
-- 1. Tạo Pluggable Database có tên là TP1 -- Thanh pho 1
CREATE PLUGGABLE DATABASE TP2
ADMIN USER admin_TP2 IDENTIFIED BY 123456 
ROLES = (DBA);
-- 2. Mở PDB TP1 lên để hoạt động
ALTER PLUGGABLE DATABASE TP2 OPEN;
-- 3. CHUYỂN SESSION (Cực kỳ quan trọng): Nhảy vào bên trong PDB TongBo vừa tạo
ALTER SESSION SET CONTAINER = TP2;

--CN2


-- 4. Tạo Tablespace DIENLUCTONG bên trong PDB TP1
CREATE TABLESPACE CN2 
DATAFILE 'CN2_TP2_data01.dbf' SIZE 100M 
AUTOEXTEND ON NEXT 50M MAXSIZE UNLIMITED;

CREATE TABLESPACE CN4
DATAFILE 'CN4_TP2_data01.dbf' SIZE 100M 
AUTOEXTEND ON NEXT 50M MAXSIZE UNLIMITED;

-- 5. Tạo một User (Schema) quản lý dự án này và cấp quyền
CREATE USER db_dienlucCN2 IDENTIFIED BY 123456 
DEFAULT TABLESPACE CN2 
QUOTA UNLIMITED ON CN2;

GRANT CONNECT, RESOURCE, CREATE VIEW TO db_dienlucCN2;


CREATE USER db_dienlucCN4 IDENTIFIED BY 123456 
DEFAULT TABLESPACE CN4
QUOTA UNLIMITED ON CN4;

GRANT CONNECT, RESOURCE, CREATE VIEW TO db_dienlucCN4;
-- Chuyển ngữ cảnh để các bảng tạo ra thuộc về user này
ALTER SESSION SET CURRENT_SCHEMA = db_dienlucCN2;

ALTER SESSION SET CURRENT_SCHEMA = db_dienlucCN4;




-- 1. Bảng chinhanh
CREATE TABLE chinhanh (
    maCN VARCHAR2(20) PRIMARY KEY,
    tenCN NVARCHAR2(255) NOT NULL,
    thanhpho VARCHAR2(100)
) ;

-- 2. Bảng nhanvien
CREATE TABLE nhanvien (
    maNV VARCHAR2(20) PRIMARY KEY,
    hoten NVARCHAR2(255) NOT NULL,
    maCN VARCHAR2(20),
    FOREIGN KEY (maCN) REFERENCES chinhanh(maCN)
) ;

-- 3. Bảng khachhang
CREATE TABLE khachhang (
    maKH VARCHAR2(20) PRIMARY KEY,
    tenKH NVARCHAR2(255) NOT NULL,
    maCN VARCHAR2(20),
    FOREIGN KEY (maCN) REFERENCES chinhanh(maCN)
) ;

-- 4. Bảng hopdong
CREATE TABLE hopdong (
    soHD VARCHAR2(26) PRIMARY KEY,
    ngayKy DATE DEFAULT SYSDATE,
    maKH VARCHAR2(20), -- Không khóa ngoại như bạn dặn
    soDienKe VARCHAR2(50),
    kwDinhMuc NUMBER,
    dongiaKW NUMBER, 
    isPaid NUMBER(1) DEFAULT 0 -- Oracle dùng NUMBER(1) thay cho kiểu bit
);

-- 5. Bảng hoadon
CREATE TABLE hoadon (
    soHDN VARCHAR2(26) PRIMARY KEY,
    thang NUMBER,
    nam NUMBER,
    soHD VARCHAR2(26),
    maNV VARCHAR2(20), -- Không khóa ngoại như bạn dặn
    soTien NUMBER, 
    thanhToan NUMBER(1) DEFAULT 0,
    FOREIGN KEY (soHD) REFERENCES hopdong(soHD)
) 
;

--tạo data link
-- 1. Chuyển về Tổng bộ (Thay tên PDB_TONGBO bằng tên thực tế của ông, hoặc để nguyên nếu Tổng bộ là gốc)
ALTER SESSION SET CONTAINER =TongBo; 
-- Hoặc ALTER SESSION SET CONTAINER = PDB_TONGBO;

-- 2. Tạo Database Link
-- Tui dùng cú pháp Easy Connect (IP:Port/Service_Name) cho ông khỏi phải config file tnsnames.ora mệt mỏi.
-- Đổi 'localhost' thành IP thật nếu server chạy khác máy nhé.
CREATE DATABASE LINK link_to_cn2
CONNECT TO db_dienlucCN2 IDENTIFIED BY "123456"
USING '//localhost:1521/TP2';

CREATE DATABASE LINK link_to_cn4
CONNECT TO db_dienlucCN4 IDENTIFIED BY "123456"
USING '//localhost:1521/TP2';