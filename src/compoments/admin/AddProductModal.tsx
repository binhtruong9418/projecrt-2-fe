import {
    Button,
    Carousel,
    Col,
    Form,
    Image,
    Input,
    InputNumber,
    Modal,
    Row,
    Select,
    Space,
    Typography,
    Upload
} from 'antd';
import {useRef, useState} from 'react';
import {toast} from 'react-toastify'

import {CloudUploadOutlined, DeleteOutlined, LeftOutlined, RightOutlined} from "@ant-design/icons";
import DysonApi from '../../axios/DysonApi.ts';
import {useQuery} from 'react-query';

const IMAGE_TYPES = ["image/png", "image/jpeg"];


const AddProductModal = ({
    isVisible,
    setIsVisible,
    refetchProduct,
}: any) => {
    const [form] = Form.useForm();
    const [imagesFile, setImagesFile] = useState<any[]>([])
    const [listImage, setListImage] = useState<any>([])
    const carouselRef = useRef(null)
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const {
        data: listCategory = [],
    } = useQuery('getListCategory', () => DysonApi.getAllCategory(), {
        refetchOnWindowFocus: 'always',
    }
    );

    const handleSubmit = async () => {
        //check error when user submit
        const data = form.getFieldsValue()
        const {
            productName,
            productDescription,
            productCategory,
            productPrice,
            productQuantity,
            productDiscount,
            author,
            publisher,
            dimension,
            totalPage
        } = data

        try {
            setIsLoading(true);
            let listNewImages: any[] = []
            if (listImage.length > 0) {
                listNewImages = await Promise.all(listImage.map((item: any) => {
                    return DysonApi.uploadFile(item)
                }))
            }
            await DysonApi.addProduct({
                name: productName,
                description: productDescription,
                category: productCategory,
                price: productPrice,
                quantity: productQuantity,
                images: listNewImages,
                discount: productDiscount ?? 0,
                author,
                publisher,
                dimension,
                totalPage
            })
            await refetchProduct()
            toast.success("Thêm sách thành công");
            onResetForm()
            setIsVisible(false);
        } catch (error: any) {
            toast.error(error.error[0]);
        } finally {
            setIsLoading(false);
        }
    }

    const handleChooseThumbnail = async ({ file }: any) => {
        if (IMAGE_TYPES.includes(file.type)) {
            setListImage([...listImage, file]);

            const reader = new FileReader();
            reader.addEventListener("load", () => {
                setImagesFile(prev => [...prev, reader.result]);
            });
            reader.readAsDataURL(file);

        } else {
            toast.error("Chỉ chấp nhận file ảnh");
        }
    };

    const handleDeleteImage = (index: number) => {
        setListImage(listImage.filter((_: any, i: number) => i !== index));
        setImagesFile(imagesFile.filter((_: any, i: number) => i !== index));
    }

    const onResetForm = () => {
        form.resetFields();
        setListImage([]);
        setImagesFile([]);
    }

    return (
        <Modal
            open={isVisible}
            onCancel={() => setIsVisible(false)}
            footer={null}
        >
            <div>
                <Typography.Title level={4}>
                    Thêm sách
                </Typography.Title>

                <Space
                    direction="vertical"
                    style={{
                        width: "100%",
                    }}
                    size="large">
                    <Upload.Dragger
                        accept={IMAGE_TYPES.join(
                            ", "
                        )}
                        customRequest={
                            handleChooseThumbnail
                        }
                        maxCount={10}
                        showUploadList={false}
                    >
                        <Button className="d-flex m-auto align-items-center">
                            <CloudUploadOutlined className='mr-2' />
                            <div>Tải ảnh (Tối đa: 10)</div>
                        </Button>
                    </Upload.Dragger>
                    {imagesFile && imagesFile.length > 0 &&
                        <Carousel ref={carouselRef} dotPosition="top">
                            {
                                imagesFile.map((x, index: any) => (
                                    <div key={index}>
                                        <div className='d-flex align-items-center justify-content-center position'>
                                            {/* @ts-ignore */}
                                            <LeftOutlined className="cursor-pointer" onClick={() => carouselRef?.current?.prev()} />
                                            <div className="m-auto" style={{
                                                width: "50%",
                                                justifyContent: "center",
                                                alignItems: "center",
                                            }}>
                                                <Image
                                                    src={x}
                                                    preview={false}
                                                />
                                            </div>
                                            {/* @ts-ignore */}
                                            <RightOutlined className="cursor-pointer" onClick={() => carouselRef?.current?.next()} />
                                        </div>
                                        <div className='d-flex justify-content-center mt-3'>
                                            <DeleteOutlined className="cursor-pointer" width={50} height={50} onClick={() => handleDeleteImage(index)} />
                                        </div>
                                    </div>
                                ))
                            }
                        </Carousel>
                    }
                </Space>

                <Form
                    style={{
                        boxShadow: '0px 4px 30px 0px rgba(27, 25, 86, 0.10)',
                        borderRadius: '12px',
                        marginTop: '24px',
                        padding: '20px 24px',
                        gap: '20px'
                    }}
                    name="addProduct"
                    onFinish={handleSubmit}
                    form={form}
                >
                    <Form.Item
                        name='productName'
                        rules={[{
                            required: true,
                            message: 'Vui lòng nhập tên sach!',
                        }]}
                    >
                        <Input
                            placeholder="Tên sách"
                            bordered={false}
                            required
                        />
                    </Form.Item>
                    <Form.Item
                        name="productDescription"
                    >
                        <Input.TextArea
                            placeholder="Miêu tả"
                            className="border round-sm"
                            rows={4}
                        />
                    </Form.Item>

                    <Form.Item
                        name="productCategory"
                        rules={[{
                            required: true,
                            message: 'Vui lòng chọn danh mục!'
                        }]}
                    >
                        <Select
                            placeholder="Danh mục"
                            allowClear
                            size="large"
                        >
                            {listCategory.map(({ name }: any) => (
                                <Select.Option
                                    value={name}
                                    key={name}>
                                    {name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name={"author"}
                    >
                        <Input
                            placeholder="Tác giả"
                            size="large"
                        />
                    </Form.Item>
                    <Form.Item
                        name={"publisher"}
                    >
                        <Input
                            placeholder="Nhà xuất bản"
                            size="large"
                        />
                    </Form.Item>
                    <Row gutter={[10, 10]}>
                        <Col span={12}>
                            <Form.Item
                                name={"dimension"}
                            >
                                <Input
                                    placeholder="Kích thước"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name={"totalPage"}
                                style={{width: '100%'}}
                            >
                                <InputNumber
                                    placeholder="Số trang"
                                    size="large"
                                    style={{width: '100%'}}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="productPrice"
                        rules={[{
                            required: true,
                            message: 'Vui lòng nhập giá sách'
                        }]}
                    >
                        <InputNumber
                            placeholder="Giá"
                            addonAfter='₫'
                            className="w-100"
                            size="large"
                            min={0}
                        />
                    </Form.Item>


                    <Form.Item
                        name="productDiscount"
                    >
                        <InputNumber
                            placeholder="Khuyến mãi"
                            addonAfter='%'
                            className="w-100"
                            size="large"
                            defaultValue={0}
                        />
                    </Form.Item>

                    <Form.Item
                        name="productQuantity"
                        rules={[{
                            required: true,
                            message: 'Vui lòng nhập số lượng sách!'
                        }]}
                    >
                        <InputNumber
                            placeholder="Số lượng"
                            className="w-100"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="w-50" disabled={isLoading}>
                            {isLoading ? 'Loading...' : 'Thêm sách'}
                        </Button>
                        <Button htmlType="button" onClick={onResetForm} className="w-50">
                            {isLoading ? 'Loading...' : 'Reset'}
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </Modal >
    )
}

export default AddProductModal