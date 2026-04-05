--3 instance 1 TongBo ( trigger copy sang 2 TP)
--admin 123456
--TP1 : NV1 123456
--TP2 : NV2 123456

ALTER SESSION SET CONTAINER = TP1;
ALTER SESSION SET CURRENT_SCHEMA = db_dienlucCN1;

ALTER SESSION SET CURRENT_SCHEMA = db_dienlucCN3;
ALTER SESSION SET CONTAINER = TP2;
ALTER SESSION SET CURRENT_SCHEMA = db_dienlucCN2;

ALTER SESSION SET CURRENT_SCHEMA = db_dienlucCN4;
ALTER SESSION SET CONTAINER = TongBo;
ALTER SESSION SET CURRENT_SCHEMA = db_dienluc;


select * from khachhang;
alter session set current_schema =NV_101 ;
alter session set current_schema =db_dienlucCN3 ;--NV_101
select * from hopdong; 

create database UsersCsdlPt;
use UsersCsdlPt;
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
    role varchar2(20),
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
    SDT VARCHAR2(15) UNIQUE,
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
    SDT VARCHAR2(15) UNIQUE,
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


CREATE TABLE lichSuChuyenCongTac(
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- Chuẩn đẻ ID tự động của Oracle
    maNV VARCHAR2(20),
     maKH VARCHAR2(20),
    NgayChuyen DATE DEFAULT SYSDATE, 
    maCNCu VARCHAR2(20),
    maCNMoi VARCHAR2(20)
);

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
    role varchar2(20),
    status NUMBER(1) DEFAULT 0,
    islocked NUMBER(1) DEFAULT 0,
    FOREIGN KEY (maCN) REFERENCES chinhanh(maCN)
) ;

-- 3. Bảng khachhang
CREATE TABLE khachhang (
    maKH VARCHAR2(26) PRIMARY KEY,
    tenKH NVARCHAR2(255) NOT NULL,
    maCN VARCHAR2(20),
    SDT VARCHAR2(15) UNIQUE,
    FOREIGN KEY (maCN) REFERENCES chinhanh(maCN)
) ;

-- 4. Bảng hopdong
CREATE TABLE hopdong (
    soHD VARCHAR2(26) PRIMARY KEY,
    ngayKy DATE DEFAULT SYSDATE,
    maKH VARCHAR2(26), -- Không khóa ngoại như bạn dặn
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



--proxy authentication
ALTER SESSION SET CONTAINER = CDB$ROOT;

-- Tạo Common User, nó sẽ tự động tàng hình có mặt ở mọi PDB (TP1, TP2, TongBo)
CREATE USER c##api_gateway IDENTIFIED BY "SuperApiPass123" CONTAINER=ALL;
GRANT CREATE SESSION TO c##api_gateway CONTAINER=ALL;
--đóng giả
ALTER SESSION SET CONTAINER = TP1;

ALTER USER db_dienlucCN1 GRANT CONNECT THROUGH c##api_gateway;
ALTER USER db_dienlucCN3 GRANT CONNECT THROUGH c##api_gateway;
ALTER SESSION SET CONTAINER = TP2;

ALTER USER db_dienlucCN2 GRANT CONNECT THROUGH c##api_gateway;
ALTER USER db_dienlucCN4 GRANT CONNECT THROUGH c##api_gateway;

--them
--bang nhanvien
 ALTER table nhanvien add islocked NUMBER(1) DEFAULT 0;
-- Chạy cho db_dienlucCN1, CN2, CN3, CN4
ALTER TABLE khachhang MODIFY maKH VARCHAR2(26);
ALTER TABLE hopdong MODIFY maKH VARCHAR2(26);


ALTER SESSION SET CONTAINER = TongBo;
ALTER SESSION SET CURRENT_SCHEMA = db_dienluc;

CREATE OR REPLACE TRIGGER trg_sync_chinhanh
AFTER INSERT OR UPDATE OR DELETE ON chinhanh
FOR EACH ROW
DECLARE
    v_maCN VARCHAR2(20);
BEGIN
    -- Xác định mã chi nhánh: Nếu XÓA thì lấy data cũ, ngược lại lấy data mới
    IF DELETING THEN v_maCN := :OLD.maCN; ELSE v_maCN := :NEW.maCN; END IF;

    IF v_maCN = 'CN1' THEN
        IF INSERTING THEN
            INSERT INTO chinhanh@link_to_cn1 (maCN, tenCN, thanhpho) VALUES (:NEW.maCN, :NEW.tenCN, :NEW.thanhpho);
        ELSIF UPDATING THEN
            UPDATE chinhanh@link_to_cn1 SET tenCN = :NEW.tenCN, thanhpho = :NEW.thanhpho WHERE maCN = :OLD.maCN;
        ELSIF DELETING THEN
            DELETE FROM chinhanh@link_to_cn1 WHERE maCN = :OLD.maCN;
        END IF;
    ELSIF v_maCN = 'CN2' THEN
        IF INSERTING THEN INSERT INTO chinhanh@link_to_cn2 (maCN, tenCN, thanhpho) VALUES (:NEW.maCN, :NEW.tenCN, :NEW.thanhpho);
        ELSIF UPDATING THEN UPDATE chinhanh@link_to_cn2 SET tenCN = :NEW.tenCN, thanhpho = :NEW.thanhpho WHERE maCN = :OLD.maCN;
        ELSIF DELETING THEN DELETE FROM chinhanh@link_to_cn2 WHERE maCN = :OLD.maCN; END IF;
    ELSIF v_maCN = 'CN3' THEN
        IF INSERTING THEN INSERT INTO chinhanh@link_to_cn3 (maCN, tenCN, thanhpho) VALUES (:NEW.maCN, :NEW.tenCN, :NEW.thanhpho);
        ELSIF UPDATING THEN UPDATE chinhanh@link_to_cn3 SET tenCN = :NEW.tenCN, thanhpho = :NEW.thanhpho WHERE maCN = :OLD.maCN;
        ELSIF DELETING THEN DELETE FROM chinhanh@link_to_cn3 WHERE maCN = :OLD.maCN; END IF;
    ELSIF v_maCN = 'CN4' THEN
        IF INSERTING THEN INSERT INTO chinhanh@link_to_cn4 (maCN, tenCN, thanhpho) VALUES (:NEW.maCN, :NEW.tenCN, :NEW.thanhpho);
        ELSIF UPDATING THEN UPDATE chinhanh@link_to_cn4 SET tenCN = :NEW.tenCN, thanhpho = :NEW.thanhpho WHERE maCN = :OLD.maCN;
        ELSIF DELETING THEN DELETE FROM chinhanh@link_to_cn4 WHERE maCN = :OLD.maCN; END IF;
    END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_sync_nhanvien
AFTER INSERT OR UPDATE OR DELETE ON nhanvien
FOR EACH ROW
BEGIN
    -- ==========================================
    -- 1. TRƯỜNG HỢP THÊM MỚI (INSERT)
    -- ==========================================
    IF INSERTING THEN
        IF :NEW.maCN = 'CN1' THEN INSERT INTO nhanvien@link_to_cn1 (maNV, hoten, maCN, status, role) VALUES (:NEW.maNV, :NEW.hoten, :NEW.maCN, :NEW.status, :NEW.role);
        ELSIF :NEW.maCN = 'CN2' THEN INSERT INTO nhanvien@link_to_cn2 (maNV, hoten, maCN, status, role) VALUES (:NEW.maNV, :NEW.hoten, :NEW.maCN, :NEW.status, :NEW.role);
        ELSIF :NEW.maCN = 'CN3' THEN INSERT INTO nhanvien@link_to_cn3 (maNV, hoten, maCN, status, role) VALUES (:NEW.maNV, :NEW.hoten, :NEW.maCN, :NEW.status, :NEW.role);
        ELSIF :NEW.maCN = 'CN4' THEN INSERT INTO nhanvien@link_to_cn4 (maNV, hoten, maCN, status, role) VALUES (:NEW.maNV, :NEW.hoten, :NEW.maCN, :NEW.status, :NEW.role);
        END IF;

    -- ==========================================
    -- 2. TRƯỜNG HỢP XÓA (DELETE)
    -- ==========================================
    ELSIF DELETING THEN
        IF :OLD.maCN = 'CN1' THEN DELETE FROM nhanvien@link_to_cn1 WHERE maNV = :OLD.maNV;
        ELSIF :OLD.maCN = 'CN2' THEN DELETE FROM nhanvien@link_to_cn2 WHERE maNV = :OLD.maNV;
        ELSIF :OLD.maCN = 'CN3' THEN DELETE FROM nhanvien@link_to_cn3 WHERE maNV = :OLD.maNV;
        ELSIF :OLD.maCN = 'CN4' THEN DELETE FROM nhanvien@link_to_cn4 WHERE maNV = :OLD.maNV;
        END IF;

    -- ==========================================
    -- 3. TRƯỜNG HỢP SỬA (UPDATE)
    -- ==========================================
    ELSIF UPDATING THEN
        -- Kịch bản 3.1: Không đổi chi nhánh, chỉ sửa thông tin (hoten, status, role)
        IF :OLD.maCN = :NEW.maCN THEN
            IF :NEW.maCN = 'CN1' THEN UPDATE nhanvien@link_to_cn1 SET hoten = :NEW.hoten, status = :NEW.status, role = :NEW.role WHERE maNV = :OLD.maNV;
            ELSIF :NEW.maCN = 'CN2' THEN UPDATE nhanvien@link_to_cn2 SET hoten = :NEW.hoten, status = :NEW.status, role = :NEW.role WHERE maNV = :OLD.maNV;
            ELSIF :NEW.maCN = 'CN3' THEN UPDATE nhanvien@link_to_cn3 SET hoten = :NEW.hoten, status = :NEW.status, role = :NEW.role WHERE maNV = :OLD.maNV;
            ELSIF :NEW.maCN = 'CN4' THEN UPDATE nhanvien@link_to_cn4 SET hoten = :NEW.hoten, status = :NEW.status, role = :NEW.role WHERE maNV = :OLD.maNV;
            END IF;
            
        -- Kịch bản 3.2: Nhân viên thuyên chuyển công tác (Đổi maCN)
        ELSE
            -- 🌟 LOGIC MỚI: GHI VÀO LỊCH SỬ THUYÊN CHUYỂN TRƯỚC 🌟
            INSERT INTO lichSuChuyenCongTac (maNV, maCNCu, maCNMoi) 
            VALUES (:OLD.maNV, :OLD.maCN, :NEW.maCN);

            -- Xóa data ở Chi nhánh cũ
            IF :OLD.maCN = 'CN1' THEN DELETE FROM nhanvien@link_to_cn1 WHERE maNV = :OLD.maNV;
            ELSIF :OLD.maCN = 'CN2' THEN DELETE FROM nhanvien@link_to_cn2 WHERE maNV = :OLD.maNV;
            ELSIF :OLD.maCN = 'CN3' THEN DELETE FROM nhanvien@link_to_cn3 WHERE maNV = :OLD.maNV;
            ELSIF :OLD.maCN = 'CN4' THEN DELETE FROM nhanvien@link_to_cn4 WHERE maNV = :OLD.maNV;
            END IF;

            -- Thêm data vào Chi nhánh mới
            IF :NEW.maCN = 'CN1' THEN INSERT INTO nhanvien@link_to_cn1 (maNV, hoten, maCN, status, role) VALUES (:NEW.maNV, :NEW.hoten, :NEW.maCN, :NEW.status, :NEW.role);
            ELSIF :NEW.maCN = 'CN2' THEN INSERT INTO nhanvien@link_to_cn2 (maNV, hoten, maCN, status, role) VALUES (:NEW.maNV, :NEW.hoten, :NEW.maCN, :NEW.status, :NEW.role);
            ELSIF :NEW.maCN = 'CN3' THEN INSERT INTO nhanvien@link_to_cn3 (maNV, hoten, maCN, status, role) VALUES (:NEW.maNV, :NEW.hoten, :NEW.maCN, :NEW.status, :NEW.role);
            ELSIF :NEW.maCN = 'CN4' THEN INSERT INTO nhanvien@link_to_cn4 (maNV, hoten, maCN, status, role) VALUES (:NEW.maNV, :NEW.hoten, :NEW.maCN, :NEW.status, :NEW.role);
            END IF;
        END IF;
    END IF;
END;
/
CREATE OR REPLACE TRIGGER trg_sync_khachhang
AFTER INSERT OR UPDATE OR DELETE ON khachhang
FOR EACH ROW
BEGIN
    -- ==========================================
    -- 1. TRƯỜNG HỢP THÊM MỚI (INSERT)
    -- ==========================================
    IF INSERTING THEN
        IF :NEW.maCN = 'CN1' THEN INSERT INTO khachhang@link_to_cn1 (maKH, tenKH, maCN, SDT) VALUES (:NEW.maKH, :NEW.tenKH, :NEW.maCN, :NEW.SDT);
        ELSIF :NEW.maCN = 'CN2' THEN INSERT INTO khachhang@link_to_cn2 (maKH, tenKH, maCN, SDT) VALUES (:NEW.maKH, :NEW.tenKH, :NEW.maCN, :NEW.SDT);
        ELSIF :NEW.maCN = 'CN3' THEN INSERT INTO khachhang@link_to_cn3 (maKH, tenKH, maCN, SDT) VALUES (:NEW.maKH, :NEW.tenKH, :NEW.maCN, :NEW.SDT);
        ELSIF :NEW.maCN = 'CN4' THEN INSERT INTO khachhang@link_to_cn4 (maKH, tenKH, maCN, SDT) VALUES (:NEW.maKH, :NEW.tenKH, :NEW.maCN, :NEW.SDT);
        END IF;

    -- ==========================================
    -- 2. TRƯỜNG HỢP XÓA (DELETE)
    -- ==========================================
    ELSIF DELETING THEN
        IF :OLD.maCN = 'CN1' THEN DELETE FROM khachhang@link_to_cn1 WHERE maKH = :OLD.maKH;
        ELSIF :OLD.maCN = 'CN2' THEN DELETE FROM khachhang@link_to_cn2 WHERE maKH = :OLD.maKH;
        ELSIF :OLD.maCN = 'CN3' THEN DELETE FROM khachhang@link_to_cn3 WHERE maKH = :OLD.maKH;
        ELSIF :OLD.maCN = 'CN4' THEN DELETE FROM khachhang@link_to_cn4 WHERE maKH = :OLD.maKH;
        END IF;

    -- ==========================================
    -- 3. TRƯỜNG HỢP SỬA (UPDATE) - CÓ BẮT LOGIC ĐỔI CHI NHÁNH
    -- ==========================================
    ELSIF UPDATING THEN
        -- Kịch bản 3.1: Không đổi chi nhánh, chỉ sửa Tên hoặc SDT
        IF :OLD.maCN = :NEW.maCN THEN
            IF :NEW.maCN = 'CN1' THEN UPDATE khachhang@link_to_cn1 SET tenKH = :NEW.tenKH, SDT = :NEW.SDT WHERE maKH = :OLD.maKH;
            ELSIF :NEW.maCN = 'CN2' THEN UPDATE khachhang@link_to_cn2 SET tenKH = :NEW.tenKH, SDT = :NEW.SDT WHERE maKH = :OLD.maKH;
            ELSIF :NEW.maCN = 'CN3' THEN UPDATE khachhang@link_to_cn3 SET tenKH = :NEW.tenKH, SDT = :NEW.SDT WHERE maKH = :OLD.maKH;
            ELSIF :NEW.maCN = 'CN4' THEN UPDATE khachhang@link_to_cn4 SET tenKH = :NEW.tenKH, SDT = :NEW.SDT WHERE maKH = :OLD.maKH;
            END IF;
            
        -- Kịch bản 3.2: Khách hàng chuyển sang Chi nhánh khác
        ELSE
            -- 🌟 LOGIC MỚI BỔ SUNG: Ghi lại lịch sử khách hàng chuyển chi nhánh 🌟
            INSERT INTO lichSuChuyenCongTac (maKH, maCNCu, maCNMoi) 
            VALUES (:OLD.maKH, :OLD.maCN, :NEW.maCN);

            -- BƯỚC A: Trảm (Delete) dữ liệu ở Chi nhánh cũ
            IF :OLD.maCN = 'CN1' THEN DELETE FROM khachhang@link_to_cn1 WHERE maKH = :OLD.maKH;
            ELSIF :OLD.maCN = 'CN2' THEN DELETE FROM khachhang@link_to_cn2 WHERE maKH = :OLD.maKH;
            ELSIF :OLD.maCN = 'CN3' THEN DELETE FROM khachhang@link_to_cn3 WHERE maKH = :OLD.maKH;
            ELSIF :OLD.maCN = 'CN4' THEN DELETE FROM khachhang@link_to_cn4 WHERE maKH = :OLD.maKH;
            END IF;

            -- BƯỚC B: Bứng (Insert) cục dữ liệu mới sang Chi nhánh mới
            IF :NEW.maCN = 'CN1' THEN INSERT INTO khachhang@link_to_cn1 (maKH, tenKH, maCN, SDT) VALUES (:NEW.maKH, :NEW.tenKH, :NEW.maCN, :NEW.SDT);
            ELSIF :NEW.maCN = 'CN2' THEN INSERT INTO khachhang@link_to_cn2 (maKH, tenKH, maCN, SDT) VALUES (:NEW.maKH, :NEW.tenKH, :NEW.maCN, :NEW.SDT);
            ELSIF :NEW.maCN = 'CN3' THEN INSERT INTO khachhang@link_to_cn3 (maKH, tenKH, maCN, SDT) VALUES (:NEW.maKH, :NEW.tenKH, :NEW.maCN, :NEW.SDT);
            ELSIF :NEW.maCN = 'CN4' THEN INSERT INTO khachhang@link_to_cn4 (maKH, tenKH, maCN, SDT) VALUES (:NEW.maKH, :NEW.tenKH, :NEW.maCN, :NEW.SDT);
            END IF;
        END IF;
    END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_sync_hopdong
AFTER INSERT OR UPDATE OR DELETE ON hopdong
FOR EACH ROW
DECLARE
    v_maCN VARCHAR2(20);
    v_maKH VARCHAR2(26); -- Chứa ULID
BEGIN
    -- Xác định mã KH tùy theo hành động
    IF DELETING THEN v_maKH := :OLD.maKH; ELSE v_maKH := :NEW.maKH; END IF;

    -- Truy vấn lấy mã Chi nhánh
    SELECT maCN INTO v_maCN FROM khachhang WHERE maKH = v_maKH;

    IF v_maCN = 'CN1' THEN
        IF INSERTING THEN
            INSERT INTO hopdong@link_to_cn1 (soHD, ngayKy, maKH, soDienKe, kwDinhMuc, dongiaKW, isPaid) VALUES (:NEW.soHD, :NEW.ngayKy, :NEW.maKH, :NEW.soDienKe, :NEW.kwDinhMuc, :NEW.dongiaKW, :NEW.isPaid);
        ELSIF UPDATING THEN
            UPDATE hopdong@link_to_cn1 SET ngayKy = :NEW.ngayKy, maKH = :NEW.maKH, soDienKe = :NEW.soDienKe, kwDinhMuc = :NEW.kwDinhMuc, dongiaKW = :NEW.dongiaKW, isPaid = :NEW.isPaid WHERE soHD = :OLD.soHD;
        ELSIF DELETING THEN
            DELETE FROM hopdong@link_to_cn1 WHERE soHD = :OLD.soHD;
        END IF;
    ELSIF v_maCN = 'CN2' THEN
        IF INSERTING THEN INSERT INTO hopdong@link_to_cn2 (soHD, ngayKy, maKH, soDienKe, kwDinhMuc, dongiaKW, isPaid) VALUES (:NEW.soHD, :NEW.ngayKy, :NEW.maKH, :NEW.soDienKe, :NEW.kwDinhMuc, :NEW.dongiaKW, :NEW.isPaid);
        ELSIF UPDATING THEN UPDATE hopdong@link_to_cn2 SET ngayKy = :NEW.ngayKy, maKH = :NEW.maKH, soDienKe = :NEW.soDienKe, kwDinhMuc = :NEW.kwDinhMuc, dongiaKW = :NEW.dongiaKW, isPaid = :NEW.isPaid WHERE soHD = :OLD.soHD;
        ELSIF DELETING THEN DELETE FROM hopdong@link_to_cn2 WHERE soHD = :OLD.soHD; END IF;
    ELSIF v_maCN = 'CN3' THEN
        IF INSERTING THEN INSERT INTO hopdong@link_to_cn3 (soHD, ngayKy, maKH, soDienKe, kwDinhMuc, dongiaKW, isPaid) VALUES (:NEW.soHD, :NEW.ngayKy, :NEW.maKH, :NEW.soDienKe, :NEW.kwDinhMuc, :NEW.dongiaKW, :NEW.isPaid);
        ELSIF UPDATING THEN UPDATE hopdong@link_to_cn3 SET ngayKy = :NEW.ngayKy, maKH = :NEW.maKH, soDienKe = :NEW.soDienKe, kwDinhMuc = :NEW.kwDinhMuc, dongiaKW = :NEW.dongiaKW, isPaid = :NEW.isPaid WHERE soHD = :OLD.soHD;
        ELSIF DELETING THEN DELETE FROM hopdong@link_to_cn3 WHERE soHD = :OLD.soHD; END IF;
    ELSIF v_maCN = 'CN4' THEN
        IF INSERTING THEN INSERT INTO hopdong@link_to_cn4 (soHD, ngayKy, maKH, soDienKe, kwDinhMuc, dongiaKW, isPaid) VALUES (:NEW.soHD, :NEW.ngayKy, :NEW.maKH, :NEW.soDienKe, :NEW.kwDinhMuc, :NEW.dongiaKW, :NEW.isPaid);
        ELSIF UPDATING THEN UPDATE hopdong@link_to_cn4 SET ngayKy = :NEW.ngayKy, maKH = :NEW.maKH, soDienKe = :NEW.soDienKe, kwDinhMuc = :NEW.kwDinhMuc, dongiaKW = :NEW.dongiaKW, isPaid = :NEW.isPaid WHERE soHD = :OLD.soHD;
        ELSIF DELETING THEN DELETE FROM hopdong@link_to_cn4 WHERE soHD = :OLD.soHD; END IF;
    END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_sync_hoadon
AFTER INSERT OR UPDATE OR DELETE ON hoadon
FOR EACH ROW
DECLARE
    v_maCN VARCHAR2(20);
    v_maNV VARCHAR2(20);
BEGIN
    -- Xác định mã nhân viên
    IF DELETING THEN v_maNV := :OLD.maNV; ELSE v_maNV := :NEW.maNV; END IF;

    -- Tìm xem nhân viên này ở chi nhánh nào
    SELECT maCN INTO v_maCN FROM nhanvien WHERE maNV = v_maNV;

    IF v_maCN = 'CN1' THEN
        IF INSERTING THEN
            INSERT INTO hoadon@link_to_cn1 (soHDN, thang, nam, soHD, maNV, soTien) 
            VALUES (:NEW.soHDN, :NEW.thang, :NEW.nam, :NEW.soHD, :NEW.maNV, :NEW.soTien);
        ELSIF UPDATING THEN
            UPDATE hoadon@link_to_cn1 SET thang = :NEW.thang, nam = :NEW.nam, soHD = :NEW.soHD, maNV = :NEW.maNV, soTien = :NEW.soTien WHERE soHDN = :OLD.soHDN;
        ELSIF DELETING THEN
            DELETE FROM hoadon@link_to_cn1 WHERE soHDN = :OLD.soHDN;
        END IF;
        
    ELSIF v_maCN = 'CN2' THEN
        IF INSERTING THEN 
            INSERT INTO hoadon@link_to_cn2 (soHDN, thang, nam, soHD, maNV, soTien) 
            VALUES (:NEW.soHDN, :NEW.thang, :NEW.nam, :NEW.soHD, :NEW.maNV, :NEW.soTien);
        ELSIF UPDATING THEN 
            UPDATE hoadon@link_to_cn2 SET thang = :NEW.thang, nam = :NEW.nam, soHD = :NEW.soHD, maNV = :NEW.maNV, soTien = :NEW.soTien WHERE soHDN = :OLD.soHDN;
        ELSIF DELETING THEN 
            DELETE FROM hoadon@link_to_cn2 WHERE soHDN = :OLD.soHDN; 
        END IF;
        
    ELSIF v_maCN = 'CN3' THEN
        IF INSERTING THEN 
            INSERT INTO hoadon@link_to_cn3 (soHDN, thang, nam, soHD, maNV, soTien) 
            VALUES (:NEW.soHDN, :NEW.thang, :NEW.nam, :NEW.soHD, :NEW.maNV, :NEW.soTien);
        ELSIF UPDATING THEN 
            UPDATE hoadon@link_to_cn3 SET thang = :NEW.thang, nam = :NEW.nam, soHD = :NEW.soHD, maNV = :NEW.maNV, soTien = :NEW.soTien WHERE soHDN = :OLD.soHDN;
        ELSIF DELETING THEN 
            DELETE FROM hoadon@link_to_cn3 WHERE soHDN = :OLD.soHDN; 
        END IF;
        
    ELSIF v_maCN = 'CN4' THEN
        IF INSERTING THEN 
            INSERT INTO hoadon@link_to_cn4 (soHDN, thang, nam, soHD, maNV, soTien) 
            VALUES (:NEW.soHDN, :NEW.thang, :NEW.nam, :NEW.soHD, :NEW.maNV, :NEW.soTien);
        ELSIF UPDATING THEN 
            UPDATE hoadon@link_to_cn4 SET thang = :NEW.thang, nam = :NEW.nam, soHD = :NEW.soHD, maNV = :NEW.maNV, soTien = :NEW.soTien WHERE soHDN = :OLD.soHDN;
        ELSIF DELETING THEN 
            DELETE FROM hoadon@link_to_cn4 WHERE soHDN = :OLD.soHDN; 
        END IF;
        
    END IF;
END;
/

-- Đảm bảo đang đứng ở Tổng Bộ và dùng đúng tài khoản
ALTER SESSION SET CONTAINER = TongBo;
ALTER SESSION SET CURRENT_SCHEMA = db_dienluc;

-- Đảm bảo đang đứng ở Tổng Bộ
ALTER SESSION SET CONTAINER = TongBo;
ALTER SESSION SET CURRENT_SCHEMA = db_dienluc;

-- ==============================================================================
-- 1. BẢNG CHI NHÁNH
-- (Nếu ông đã có CN1, CN2, CN3, CN4 rồi thì BỎ QUA đoạn này để khỏi lỗi ORA-00001)
-- ==============================================================================
INSERT INTO chinhanh (maCN, tenCN, thanhpho) VALUES ('CN1', N'Công ty Điện lực Quận 1', 'TP1');
INSERT INTO chinhanh (maCN, tenCN, thanhpho) VALUES ('CN2', N'Công ty Điện lực Quận Ninh Kiều', 'TP2');
INSERT INTO chinhanh (maCN, tenCN, thanhpho) VALUES ('CN3', N'Công ty Điện lực Quận 3', 'TP1');
INSERT INTO chinhanh (maCN, tenCN, thanhpho) VALUES ('CN4', N'Công ty Điện lực Quận Cái Răng', 'TP2');

-- ==============================================================================
-- 2. BẢNG NHÂN VIÊN (Mã NV phân bổ thực tế)
-- ==============================================================================
INSERT INTO nhanvien (maNV, hoten, maCN, islocked) 
VALUES ('NV_101', N'Nguyễn Hoàng Minh', 'CN1', 0);

INSERT INTO nhanvien (maNV, hoten, maCN, islocked) 
VALUES ('NV_201', N'Trần Thị Thanh Trúc', 'CN2', 0);

INSERT INTO nhanvien (maNV, hoten, maCN, islocked) 
VALUES ('NV_301', N'Phạm Lê Thái Bình', 'CN3', 0);

INSERT INTO nhanvien (maNV, hoten, maCN, islocked) 
VALUES ('NV_401', N'Lê Minh Hoàng', 'CN4', 0);

-- ==============================================================================
-- 3. BẢNG KHÁCH HÀNG (Mã khách hàng dùng chuẩn ULID 26 ký tự)
-- ==============================================================================
INSERT INTO khachhang (maKH, tenKH, maCN) 
VALUES ('01HT3A1B2C3D4E5F6G7H8J9K0M', N'Công ty CP Đầu tư Nam Long', 'CN1');

INSERT INTO khachhang (maKH, tenKH, maCN) 
VALUES ('01HT3A2B3C4D5E6F7G8H9J0K1M', N'Nguyễn Văn Toàn', 'CN2');

INSERT INTO khachhang (maKH, tenKH, maCN) 
VALUES ('01HT3A3B4C5D6E7F8G9H0J1K2M', N'Bệnh viện Đa khoa Quốc tế', 'CN3');

INSERT INTO khachhang (maKH, tenKH, maCN) 
VALUES ('01HT3A4B5C6D7E8F9G0H1J2K3M', N'Trần Đại Nghĩa', 'CN4');

-- ==============================================================================
-- 4. BẢNG HỢP ĐỒNG (Mã Hợp đồng dùng chuẩn ULID, nối đúng ULID Khách hàng ở trên)
-- Dữ liệu giả định: Định mức 400 kWh, đơn giá bậc thang trung bình 3100 VNĐ
-- ==============================================================================
INSERT INTO hopdong (soHD, ngayKy, maKH, soDienKe, kwDinhMuc, dongiaKW, isPaid) 
VALUES ('01HT3B1C2D3E4F5G6H7J8K9M0N', TO_DATE('2025-10-15', 'YYYY-MM-DD'), '01HT3A1B2C3D4E5F6G7H8J9K0M', 'DK_Q1_00892', 400, 3100, 1);

INSERT INTO hopdong (soHD, ngayKy, maKH, soDienKe, kwDinhMuc, dongiaKW, isPaid) 
VALUES ('01HT3B2C3D4E5F6G7H8J9K0M1N', TO_DATE('2025-11-20', 'YYYY-MM-DD'), '01HT3A2B3C4D5E6F7G8H9J0K1M', 'DK_NK_00124', 250, 2800, 1);

INSERT INTO hopdong (soHD, ngayKy, maKH, soDienKe, kwDinhMuc, dongiaKW, isPaid) 
VALUES ('01HT3B3C4D5E6F7G8H9J0K1M2N', TO_DATE('2025-12-01', 'YYYY-MM-DD'), '01HT3A3B4C5D6E7F8G9H0J1K2M', 'DK_Q3_09331', 800, 3500, 1);

INSERT INTO hopdong (soHD, ngayKy, maKH, soDienKe, kwDinhMuc, dongiaKW, isPaid) 
VALUES ('01HT3B4C5D6E7F8G9H0J1K2M3N', TO_DATE('2026-01-10', 'YYYY-MM-DD'), '01HT3A4B5C6D7E8F9G0H1J2K3M', 'DK_CR_00562', 150, 2500, 0);

-- ==============================================================================
-- 5. BẢNG HÓA ĐƠN (Mã Hóa đơn dùng chuẩn ULID, nối đúng Hợp đồng và Nhân viên)
-- ==============================================================================
-- CN1: Thu tiền điện Nam Long (Đã thanh toán)
INSERT INTO hoadon (soHDN, thang, nam, soHD, maNV, soTien) 
VALUES ('01HT3C1D2E3F4G5H6J7K8M9N0P', 3, 2026, '01HT3B1C2D3E4F5G6H7J8K9M0N', 'NV_101', 1240000);

-- CN2: Thu tiền điện Nguyễn Văn Toàn (Chưa thanh toán)
INSERT INTO hoadon (soHDN, thang, nam, soHD, maNV, soTien) 
VALUES ('01HT3C2D3E4F5G6H7J8K9M0N1P', 3, 2026, '01HT3B2C3D4E5F6G7H8J9K0M1N', 'NV_201', 700000);

-- CN3: Thu tiền điện Bệnh viện (Chưa thanh toán)
INSERT INTO hoadon (soHDN, thang, nam, soHD, maNV, soTien) 
VALUES ('01HT3C3D4E5F6G7H8J9K0M1N2P', 3, 2026, '01HT3B3C4D5E6F7G8H9J0K1M2N', 'NV_301', 2800000);

-- CN4: Thu tiền điện Trần Đại Nghĩa (Chưa thanh toán)
INSERT INTO hoadon (soHDN, thang, nam, soHD, maNV, soTien) 
VALUES ('01HT3C4D5E6F7G8H9J0K1M2N3P', 3, 2026, '01HT3B4C5D6E7F8G9H0J1K2M3N', 'NV_401', 375000);

-- CHỐT GIAO DỊCH
COMMIT;


-- Đảm bảo đang đứng ở Tổng Bộ
ALTER SESSION SET CONTAINER = TongBo;
ALTER SESSION SET CURRENT_SCHEMA = db_dienluc;

-- Xóa từ ngọn (con) ngược lên gốc (cha)
DELETE FROM hoadon;
DELETE FROM hopdong;
DELETE FROM khachhang;
DELETE FROM nhanvien ; -- Giữ lại ông Trùm ở Tổng Bộ
DELETE FROM chinhanh;

-- Bắt buộc phải COMMIT để chốt giao dịch, Trigger mới chốt theo
COMMIT;



select * from nhanvien
select * from chinhanh
    SELECT hd.soHD,
           hd.maKH,
           kh.tenKH,
           hd.ngayKy,
           hd.soDienKe,
           hd.kwDinhMuc,
           hd.dongiaKW,
           hd.isPaid
    FROM hopdong hd
    INNER JOIN khachhang kh ON hd.maKH = kh.maKH


--test api
SELECT COUNT(maNV) AS SO_LUONG_NV FROM db_dienluc.nhanvien
SELECT COUNT(maKH) AS SO_LUONG_KH FROM db_dienluc.khachhang
select * from khachhang

select * from nhanvien
--chưa chạy
-- 1. Thêm cột status (kiểu số nguyên nhỏ), mặc định nhân viên mới vào là 0 , 1 là có tài khoản , 2 là bị khóa , 3 là bị xóa,4 là tài khoản đang sửa role
ALTER TABLE nhanvien ADD status NUMBER(1) DEFAULT 0;

-- 2. Cập nhật lại mấy ông nhân viên cũ hôm qua mình insert tay thành trạng thái 1 (Active)
UPDATE db_dienluc.nhanvien SET status = 1;

-- 3. Xóa sổ cột islocked cũ đi cho nhẹ nợ
ALTER TABLE nhanvien DROP COLUMN islocked;

COMMIT;

-- tạo admin
ALTER SESSION SET CONTAINER = TongBo;
ALTER SESSION SET CURRENT_SCHEMA = db_dienluc;

-- 1. Khai sinh cái móng Tổng bộ vào bảng Chi nhánh trước (Đỡ lỗi khóa ngoại)
INSERT INTO chinhanh (maCN, tenCN, thanhpho) 
VALUES ('TongBo', N'Trụ sở Tổng Công ty Điện Lực', 'TongBo');

-- 2. Đón ông Trùm vào làm việc
INSERT INTO nhanvien (maNV, hoten, maCN, role, status) 
VALUES ('NV_000', N'Trùm Cuối Tổng Bộ', 'TongBo', 'R_ADMIN', 1);

-- Chốt đơn!
COMMIT;




ALTER SESSION SET CONTAINER = TongBo;
ALTER SESSION SET CURRENT_SCHEMA = db_dienluc;

-- ==========================================
-- 1. TẠO ROLE VÀ GÁN QUYỀN TẠI TỔNG BỘ
-- ==========================================
CREATE ROLE R_MANAGER;
CREATE ROLE R_STAFF;
CREATE ROLE R_ADMIN;

-- Quyền của Staff
GRANT INSERT ON hopdong TO R_STAFF;
GRANT INSERT, SELECT ON khachhang TO R_STAFF;
GRANT INSERT ON hoadon TO R_STAFF;
GRANT UPDATE (ispaid) ON hopdong TO R_STAFF;

-- Quyền của Manager (Kế thừa Staff)
GRANT UPDATE (tencn) ON chinhanh TO R_MANAGER;
GRANT UPDATE (hoten) ON nhanvien TO R_MANAGER;
GRANT UPDATE (sdt, tenkh, macn) ON khachhang TO R_MANAGER;
GRANT UPDATE, DELETE ON hopdong TO R_MANAGER;
GRANT R_STAFF TO R_MANAGER;

-- Quyền Admin
GRANT ALL PRIVILEGES TO R_ADMIN;

-- ==========================================
-- 2. TẠO TÀI KHOẢN VÀ GẮN ROLE TẠI TỔNG BỘ
-- ==========================================
CREATE USER NV_000 IDENTIFIED BY 123456;
CREATE USER NV_101 IDENTIFIED BY 123456;
CREATE USER NV_201 IDENTIFIED BY 123456;
CREATE USER NV_301 IDENTIFIED BY 123456;
CREATE USER NV_401 IDENTIFIED BY 123456;

GRANT CREATE SESSION TO NV_000, NV_101, NV_201, NV_301, NV_401;

GRANT R_ADMIN TO NV_000;
GRANT R_STAFF TO NV_101;
GRANT R_STAFF TO NV_201;
GRANT R_MANAGER TO NV_301;
GRANT R_MANAGER TO NV_401;

-- ==========================================
-- 3. CẬP NHẬT CỘT "ROLE" TRONG BẢNG NHÂN VIÊN
-- ==========================================
-- Admin
UPDATE nhanvien SET role = 'R_ADMIN' WHERE maNV = 'NV_000';
-- Staff
UPDATE nhanvien SET role = 'R_STAFF' WHERE maNV IN ('NV_101', 'NV_201');
-- Manager
UPDATE nhanvien SET role = 'R_MANAGER' WHERE maNV IN ('NV_301', 'NV_401');

COMMIT;



ALTER SESSION SET CONTAINER = TP1;
-- Thành công vì NV_301 có quyền SELECT trên Schema CN3
-- Tạo acc để API có thể login vào TP1
CREATE USER NV_101 IDENTIFIED BY 123456; 
CREATE USER NV_301 IDENTIFIED BY 123456; 
GRANT CREATE SESSION TO NV_101, NV_301;

-- Cấp quyền CHỈ ĐỌC (SELECT) cho NV_101 vào Schema CN1
GRANT SELECT ON db_dienlucCN1.chinhanh TO NV_101;
GRANT SELECT ON db_dienlucCN1.nhanvien TO NV_101;
GRANT SELECT ON db_dienlucCN1.khachhang TO NV_101;
GRANT SELECT ON db_dienlucCN1.hopdong TO NV_101;
GRANT SELECT ON db_dienlucCN1.hoadon TO NV_101;

-- Cấp quyền CHỈ ĐỌC (SELECT) cho NV_301 vào Schema CN3
GRANT SELECT ON db_dienlucCN3.chinhanh TO NV_301;
GRANT SELECT ON db_dienlucCN3.nhanvien TO NV_301;
GRANT SELECT ON db_dienlucCN3.khachhang TO NV_301;
GRANT SELECT ON db_dienlucCN3.hopdong TO NV_301;
GRANT SELECT ON db_dienlucCN3.hoadon TO NV_301;




ALTER SESSION SET CONTAINER = TP2;

-- Tạo acc để API có thể login vào TP2
CREATE USER NV_201 IDENTIFIED BY 123456; 
CREATE USER NV_401 IDENTIFIED BY 123456; 
GRANT CREATE SESSION TO NV_201, NV_401;

-- Cấp quyền CHỈ ĐỌC (SELECT) cho NV_201 vào Schema CN2
GRANT SELECT ON db_dienlucCN2.chinhanh TO NV_201;
GRANT SELECT ON db_dienlucCN2.nhanvien TO NV_201;
GRANT SELECT ON db_dienlucCN2.khachhang TO NV_201;
GRANT SELECT ON db_dienlucCN2.hopdong TO NV_201;
GRANT SELECT ON db_dienlucCN2.hoadon TO NV_201;

-- Cấp quyền CHỈ ĐỌC (SELECT) cho NV_401 vào Schema CN4
GRANT SELECT ON db_dienlucCN4.chinhanh TO NV_401;
GRANT SELECT ON db_dienlucCN4.nhanvien TO NV_401;
GRANT SELECT ON db_dienlucCN4.khachhang TO NV_401;
GRANT SELECT ON db_dienlucCN4.hopdong TO NV_401;
GRANT SELECT ON db_dienlucCN4.hoadon TO NV_401;

SELECT ROLE 
    FROM SESSION_ROLES 
    WHERE ROLE IN ('R_ADMIN', 'R_MANAGER', 'R_STAFF')
-- ví dụ 
-- GRANT R_STAFF TO NV001;
-- GRANT R_MANAGER TO NV002;

ALTER SESSION SET CONTAINER = TongBo;
ALTER SESSION SET CURRENT_SCHEMA = db_dienluc;

-- Triệu hồi Admin Tổng Bộ (Active sẵn và cầm luôn Role Admin)
INSERT INTO nhanvien (maNV, hoten, maCN, role, status) 
VALUES ('NV_000', N'admin tổng bộ', 'TongBo', 'R_ADMIN', 1);

COMMIT;



--check kết nối và đăng nhập
ALTER SESSION SET CONTAINER = TongBo;

-- Xem 5 thanh niên này đang cầm Role gì trong tay
SELECT GRANTEE AS TEN_TAI_KHOAN, GRANTED_ROLE AS QUYEN_HAN 
FROM DBA_ROLE_PRIVS 
WHERE GRANTEE IN ('NV_000', 'NV_101', 'NV_201', 'NV_301', 'NV_401')
ORDER BY GRANTEE;


-- Soi TP1
ALTER SESSION SET CONTAINER = TP1;
SELECT GRANTEE AS TEN_TAI_KHOAN, TABLE_NAME AS TEN_BANG, PRIVILEGE AS QUYEN 
FROM DBA_TAB_PRIVS 
WHERE GRANTEE IN ('NV_101', 'NV_301') 
ORDER BY GRANTEE, TABLE_NAME;

-- Soi TP2
ALTER SESSION SET CONTAINER = TP2;
SELECT GRANTEE AS TEN_TAI_KHOAN, TABLE_NAME AS TEN_BANG, PRIVILEGE AS QUYEN 
FROM DBA_TAB_PRIVS 
WHERE GRANTEE IN ('NV_201', 'NV_401') 
ORDER BY GRANTEE, TABLE_NAME;

select * from chinhanh
select hoten,tenCN,nhanvien.maCN,thanhpho,role from nhanvien,chinhanh where nhanvien.maCN=chinhanh.maCN and nhanvien.maNV='NV_000';



-- 1. Chui vào nhà Tổng Bộ và cấp sổ đỏ
ALTER SESSION SET CONTAINER = TongBo;
CREATE OR REPLACE DIRECTORY backup_dir AS 'C:\DoAnCSDLOracle\Power_Corporation_System\setup\oracleBackup';
GRANT READ, WRITE ON DIRECTORY backup_dir TO sys;

-- 2. Chui vào nhà Chi nhánh 1 (TP1) và cấp sổ đỏ
ALTER SESSION SET CONTAINER = TP1;
CREATE OR REPLACE DIRECTORY backup_dir AS 'C:\DoAnCSDLOracle\Power_Corporation_System\setup\oracleBackup';
GRANT READ, WRITE ON DIRECTORY backup_dir TO sys;

-- 3. Chui vào nhà Chi nhánh 2 (TP2) và cấp sổ đỏ
ALTER SESSION SET CONTAINER = TP2;
CREATE OR REPLACE DIRECTORY backup_dir AS 'C:\OracleBackup';
GRANT READ, WRITE ON DIRECTORY backup_dir TO sys;

--CHECK XEM CÓ HỢP ĐỒNG HAY KHÔNG 
--NẾU CÓ THÌ HIỂN THỊ SỐ HỢP ĐỒNG VÀ NGÀY KÝ VÀ CÓ THỂ THANH TOÁN HỢP ĐỒNG ĐÓ. 
--NẾU KHÔNG THÌ TẠO KHÁCH HÀNG
select SOHD,NGAYKY from hopdong 
join khachhang on hopdong.maKH = khachhang.maKH
join chinhanh on khachhang.maCN = chinhanh.maCN 
where hopdong.isPaid=0 and maKH=:maKH


CREATE OR REPLACE DIRECTORY backup_dir AS 'C:\DoAnCSDLOracle\Power_Corporation_System\setup\oracleBackup';
GRANT READ, WRITE ON DIRECTORY backup_dir TO sys;
>>>>>>> acb34b0861da931ef17ab2e6f06e0e34a15fa270
